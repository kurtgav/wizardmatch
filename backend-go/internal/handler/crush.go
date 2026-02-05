package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type CrushHandler struct{}

func NewCrushHandler() *CrushHandler {
	return &CrushHandler{}
}

type crushEntry struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

type crushListRequest struct {
	Crushes []crushEntry `json:"crushes"`
}

func (h *CrushHandler) SubmitCrushList(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	var req crushListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}
	if len(req.Crushes) > 10 {
		respondError(c, http.StatusBadRequest, "Maximum 10 crushes allowed")
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

	campaign, err := store.GetActiveCampaign(c)
	if err != nil {
		respondError(c, http.StatusBadRequest, "No active campaign: "+err.Error())
		return
	}

	if err := store.DeleteCrushesForUserCampaign(c, repository.DeleteCrushesForUserCampaignParams{
		UserID:     userUUID,
		CampaignID: campaign.ID,
	}); err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update crush list")
		return
	}

	mutualCount := 0
	created := make([]repository.CrushList, 0, len(req.Crushes))
	for _, crush := range req.Crushes {
		email := strings.ToLower(strings.TrimSpace(crush.Email))
		if email == "" {
			continue
		}

		isMutual := false
		mutualCrushes, _ := store.ListCrushesByEmailCampaign(c, repository.ListCrushesByEmailCampaignParams{
			CrushEmail: email,
			CampaignID: campaign.ID,
		})
		for _, entry := range mutualCrushes {
			if entry.UserID != userUUID {
				isMutual = true
				break
			}
		}

		crushName := crush.Name
		if isMutual {
			mutualCount++
		}

		createdCrush, err := store.CreateCrush(c, repository.CreateCrushParams{
			UserID:     userUUID,
			CampaignID: campaign.ID,
			CrushEmail: email,
			CrushName:  pgtype.Text{String: crushName, Valid: crushName != ""},
			IsMatched:  false,
			IsMutual:   isMutual,
			NudgeSent:  false,
		})
		if err == nil {
			created = append(created, createdCrush)
		}
	}

	message := "Crush list submitted successfully!"
	if mutualCount > 0 {
		message = "Crush list submitted! You have " + intToString(mutualCount) + " mutual crush" + pluralize(mutualCount) + "!"
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"success":     true,
			"crushCount":  len(req.Crushes),
			"mutualCount": mutualCount,
			"crushes":     created,
		},
		"message": message,
	})
}

func (h *CrushHandler) GetCrushList(c *gin.Context) {
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

	campaign, err := store.GetActiveCampaign(c)
	if err != nil {
		respondError(c, http.StatusBadRequest, "No active campaign: "+err.Error())
		return
	}

	crushes, err := store.ListCrushesForUserCampaign(c, repository.ListCrushesForUserCampaignParams{
		UserID:     userUUID,
		CampaignID: campaign.ID,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load crush list: "+err.Error())
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    crushes,
		"count":   len(crushes),
	})
}

func (h *CrushHandler) UpdateCrushList(c *gin.Context) {
	h.SubmitCrushList(c)
}

func (h *CrushHandler) GetMutualCrushes(c *gin.Context) {
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

	campaign, err := store.GetActiveCampaign(c)
	if err != nil {
		respondError(c, http.StatusBadRequest, "No active campaign")
		return
	}

	crushes, err := store.ListCrushesForUserCampaign(c, repository.ListCrushesForUserCampaignParams{
		UserID:     userUUID,
		CampaignID: campaign.ID,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load mutual crushes")
		return
	}

	mutual := make([]repository.CrushList, 0)
	for _, entry := range crushes {
		if entry.IsMutual {
			mutual = append(mutual, entry)
		}
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    mutual,
		"count":   len(mutual),
	})
}

func (h *CrushHandler) GetCrushedBy(c *gin.Context) {
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

	campaign, err := store.GetActiveCampaign(c)
	if err != nil {
		respondError(c, http.StatusBadRequest, "No active campaign")
		return
	}

	user, err := store.GetUserByID(c, userUUID)
	if err != nil {
		respondJSON(c, http.StatusOK, gin.H{
			"success": true,
			"data":    gin.H{"count": 0, "hasCrushes": false},
		})
		return
	}

	crushedBy, _ := store.ListCrushesByEmailCampaign(c, repository.ListCrushesByEmailCampaignParams{
		CrushEmail: user.Email,
		CampaignID: campaign.ID,
	})

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"count":            len(crushedBy),
			"hasCrushes":       len(crushedBy) > 0,
			"revealIdentities": campaignPhase(campaign) == "results_released",
			"crushedBy":        crushedBy,
		},
	})
}

func (h *CrushHandler) GetCampaignCrushes(c *gin.Context) {
	campaignUUID, err := uuid.Parse(c.Param("campaignId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	crushes, err := store.ListCrushesForCampaign(c, campaignUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load campaign crushes")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    crushes,
		"count":   len(crushes),
	})
}

func pluralize(count int) string {
	if count == 1 {
		return ""
	}
	return "es"
}

func intToString(value int) string {
	return strconv.Itoa(value)
}
