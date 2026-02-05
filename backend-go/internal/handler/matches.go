package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type MatchHandler struct{}

func NewMatchHandler() *MatchHandler {
	return &MatchHandler{}
}

func (h *MatchHandler) GetMatches(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	user, err := store.GetUserByID(c, userUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "User not found")
		return
	}
	if !user.SurveyCompleted {
		respondError(c, http.StatusBadRequest, "Please complete the survey first")
		return
	}

	matches, err := store.ListMatchesForUser(c, userUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load matches")
		return
	}

	formatted := make([]gin.H, 0, len(matches))
	for _, match := range matches {
		otherUserID := match.User1ID
		if match.User1ID == userUUID {
			otherUserID = match.User2ID
		}

		otherUser, err := store.GetUserByID(c, otherUserID)
		if err != nil {
			continue
		}

		matchedUser := gin.H{
			"id":              otherUser.ID,
			"firstName":       otherUser.FirstName,
			"lastName":        maskLastName(otherUser.LastName, match.IsRevealed),
			"program":         textValue(otherUser.Program),
			"yearLevel":       intValue(otherUser.YearLevel),
			"profilePhotoUrl": revealText(otherUser.ProfilePhotoUrl, match.IsRevealed),
			"bio":             revealText(otherUser.Bio, match.IsRevealed),
		}

		shared := map[string]any{}
		if len(match.SharedInterests) > 0 {
			_ = json.Unmarshal(match.SharedInterests, &shared)
		}

		formatted = append(formatted, gin.H{
			"id":                 match.ID,
			"matchedUser":        matchedUser,
			"compatibilityScore": numericFloat(match.CompatibilityScore),
			"matchTier":          textValue(match.MatchTier),
			"sharedInterests":    shared,
			"isRevealed":         match.IsRevealed,
			"isMutualInterest":   match.IsMutualInterest,
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    formatted,
		"count":   len(formatted),
	})
}

func (h *MatchHandler) GetMatchById(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	matchUUID, err := uuid.Parse(c.Param("matchId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid match ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	match, err := store.GetMatchByID(c, matchUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Match not found")
		return
	}
	if match.User1ID != userUUID && match.User2ID != userUUID {
		respondError(c, http.StatusForbidden, "Access denied")
		return
	}

	otherUserID := match.User1ID
	if match.User1ID == userUUID {
		otherUserID = match.User2ID
	}
	otherUser, err := store.GetUserByID(c, otherUserID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load match")
		return
	}

	shared := map[string]any{}
	if len(match.SharedInterests) > 0 {
		_ = json.Unmarshal(match.SharedInterests, &shared)
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id": match.ID,
			"matchedUser": gin.H{
				"id":              otherUser.ID,
				"firstName":       otherUser.FirstName,
				"lastName":        maskLastName(otherUser.LastName, match.IsRevealed),
				"program":         textValue(otherUser.Program),
				"yearLevel":       intValue(otherUser.YearLevel),
				"profilePhotoUrl": revealText(otherUser.ProfilePhotoUrl, match.IsRevealed),
				"bio":             revealText(otherUser.Bio, match.IsRevealed),
				"instagramHandle": revealText(otherUser.InstagramHandle, match.IsRevealed),
				"facebookProfile": revealText(otherUser.FacebookProfile, match.IsRevealed),
			},
			"compatibilityScore": numericFloat(match.CompatibilityScore),
			"matchTier":          textValue(match.MatchTier),
			"sharedInterests":    shared,
			"isRevealed":         match.IsRevealed,
			"isMutualInterest":   match.IsMutualInterest,
		},
	})
}

func (h *MatchHandler) RevealMatch(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	matchUUID, err := uuid.Parse(c.Param("matchId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid match ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	match, err := store.GetMatchByID(c, matchUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Match not found")
		return
	}
	if match.User1ID != userUUID && match.User2ID != userUUID {
		respondError(c, http.StatusForbidden, "Access denied")
		return
	}

	updated, err := store.RevealMatch(c, matchUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to reveal match")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"isRevealed": updated.IsRevealed,
			"revealedAt": updated.RevealedAt,
		},
		"message": "Match revealed successfully",
	})
}

type markInterestRequest struct {
	Interested bool `json:"interested"`
}

func (h *MatchHandler) MarkInterest(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	matchUUID, err := uuid.Parse(c.Param("matchId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid match ID")
		return
	}

	var req markInterestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	match, err := store.GetMatchByID(c, matchUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Match not found")
		return
	}
	if match.User1ID != userUUID && match.User2ID != userUUID {
		respondError(c, http.StatusForbidden, "Access denied")
		return
	}

	_, err = store.CreateInteraction(c, repository.CreateInteractionParams{
		MatchID:         matchUUID,
		UserID:          userUUID,
		InteractionType: interactionType(req.Interested),
		Metadata:        []byte("{}"),
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to record interest")
		return
	}

	if req.Interested {
		other, err := store.FindInterestByMatchOtherUser(c, repository.FindInterestByMatchOtherUserParams{
			MatchID: matchUUID,
			UserID:  userUUID,
		})
		if err == nil && other.ID != uuid.Nil {
			_, _ = store.UpdateMatchInterest(c, repository.UpdateMatchInterestParams{
				ID:                matchUUID,
				IsMutualInterest:  true,
				MessagingUnlocked: true,
			})
			respondJSON(c, http.StatusOK, gin.H{
				"success": true,
				"data":    gin.H{"isMutualInterest": true},
				"message": "It's a match! You both are interested in each other!",
			})
			return
		}
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "Interest recorded",
	})
}

type reportMatchRequest struct {
	Reason string `json:"reason"`
}

func (h *MatchHandler) ReportMatch(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	matchUUID, err := uuid.Parse(c.Param("matchId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid match ID")
		return
	}

	var req reportMatchRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Reason == "" {
		respondError(c, http.StatusBadRequest, "Reason is required")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	match, err := store.GetMatchByID(c, matchUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Match not found")
		return
	}
	if match.User1ID != userUUID && match.User2ID != userUUID {
		respondError(c, http.StatusForbidden, "Access denied")
		return
	}

	metadata, _ := json.Marshal(map[string]string{"reason": req.Reason})
	_, err = store.CreateInteraction(c, repository.CreateInteractionParams{
		MatchID:         matchUUID,
		UserID:          userUUID,
		InteractionType: "report",
		Metadata:        metadata,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to submit report")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "Report submitted. We will review it shortly.",
	})
}

func revealText(value pgtype.Text, revealed bool) string {
	if !revealed {
		return ""
	}
	return textValue(value)
}

func maskLastName(lastName string, revealed bool) string {
	if revealed {
		return lastName
	}
	if lastName == "" {
		return ""
	}
	return string(lastName[0]) + "."
}

func interactionType(interested bool) string {
	if interested {
		return "interest"
	}
	return "not_interested"
}

func (h *MatchHandler) GetPotentialMatches(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	users, err := store.ListPotentialMatches(c, userUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load potential matches")
		return
	}

	formatted := make([]gin.H, 0, len(users))
	for _, user := range users {
		formatted = append(formatted, gin.H{
			"id":              user.ID,
			"firstName":       user.FirstName,
			"lastName":        string(user.LastName[0]) + ".",
			"program":         textValue(user.Program),
			"yearLevel":       intValue(user.YearLevel),
			"profilePhotoUrl": textValue(user.ProfilePhotoUrl),
			"bio":             textValue(user.Bio),
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    formatted,
		"count":   len(formatted),
	})
}

func (h *MatchHandler) PassUser(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	targetUUID, err := uuid.Parse(c.Param("targetUserId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid target user ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	match, err := store.FindOrCreateMatchForUsers(c, repository.FindOrCreateMatchForUsersParams{
		Column1: userUUID,
		Column2: targetUUID,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to process")
		return
	}

	_, err = store.CreateInteraction(c, repository.CreateInteractionParams{
		MatchID:         match.ID,
		UserID:          userUUID,
		InteractionType: "pass",
		Metadata:        []byte("{}"),
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to record pass")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "User passed",
	})
}

func (h *MatchHandler) InterestUser(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	targetUUID, err := uuid.Parse(c.Param("targetUserId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid target user ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	match, err := store.FindOrCreateMatchForUsers(c, repository.FindOrCreateMatchForUsersParams{
		Column1: userUUID,
		Column2: targetUUID,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to process")
		return
	}

	_, err = store.CreateInteraction(c, repository.CreateInteractionParams{
		MatchID:         match.ID,
		UserID:          userUUID,
		InteractionType: "interest",
		Metadata:        []byte("{}"),
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to record interest")
		return
	}

	other, err := store.FindInterestByMatchOtherUser(c, repository.FindInterestByMatchOtherUserParams{
		MatchID: match.ID,
		UserID:  userUUID,
	})
	if err == nil && other.ID != uuid.Nil {
		_, _ = store.UpdateMatchInterest(c, repository.UpdateMatchInterestParams{
			ID:                match.ID,
			IsMutualInterest:  true,
			MessagingUnlocked: true,
		})
		respondJSON(c, http.StatusOK, gin.H{
			"success":          true,
			"isMutualInterest": true,
			"message":          "It's a match! You both are interested in each other!",
		})
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "Interest recorded",
	})
}
