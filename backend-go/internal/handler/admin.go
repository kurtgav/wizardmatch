package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
	"wizardmatch-backend/internal/service"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

func (h *AdminHandler) GetStats(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	totalUsers, _ := store.CountUsers(c)
	completed, _ := store.CountCompletedSurveys(c)
	matches, _ := store.CountMatches(c)
	activeUsers, _ := store.CountActiveUsers(c)

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalUsers":       totalUsers,
			"completedSurveys": completed,
			"totalMatches":     matches,
			"activeUsers":      activeUsers,
			"completionRate":   percentage(totalUsers, completed),
		},
	})
}

func (h *AdminHandler) GetUsers(c *gin.Context) {
	page, limit := parsePagination(c)
	search := c.Query("search")

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	if search != "" {
		rows, err := store.SearchUsersAdmin(c, repository.SearchUsersAdminParams{
			FirstName: "%" + search + "%",
			Limit:     int32(limit),
			Offset:    int32((page - 1) * limit),
		})
		if err != nil {
			respondError(c, http.StatusInternalServerError, "Failed to load users")
			return
		}
		total, _ := store.CountUsersSearch(c, "%"+search+"%")

		respondJSON(c, http.StatusOK, gin.H{
			"success":    true,
			"data":       mapUsersSearch(rows),
			"pagination": paginationPayload(page, limit, total),
		})
		return
	}

	rows, err := store.ListUsersAdmin(c, repository.ListUsersAdminParams{
		Limit:  int32(limit),
		Offset: int32((page - 1) * limit),
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load users")
		return
	}
	total, _ := store.CountUsers(c)

	respondJSON(c, http.StatusOK, gin.H{
		"success":    true,
		"data":       mapUsers(rows),
		"pagination": paginationPayload(page, limit, total),
	})
}

func (h *AdminHandler) UpdateUser(c *gin.Context) {
	userUUID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var payload struct {
		Email           *string `json:"email"`
		FirstName       *string `json:"firstName"`
		LastName        *string `json:"lastName"`
		Program         *string `json:"program"`
		YearLevel       *int32  `json:"yearLevel"`
		SurveyCompleted *bool   `json:"surveyCompleted"`
		IsActive        *bool   `json:"isActive"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	params := repository.UpdateUserAdminParams{
		ID:              userUUID,
		Email:           optionalString(payload.Email),
		FirstName:       optionalString(payload.FirstName),
		LastName:        optionalString(payload.LastName),
		Program:         optionalText(payload.Program),
		YearLevel:       optionalInt(payload.YearLevel),
		SurveyCompleted: boolPointerValue(payload.SurveyCompleted),
		IsActive:        boolPointerValue(payload.IsActive),
	}

	updated, err := store.UpdateUserAdmin(c, params)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update user")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    updated,
		"message": "User updated successfully",
	})
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	userUUID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	if err := store.DeleteUser(c, userUUID); err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "User deleted successfully",
	})
}

func (h *AdminHandler) CreateQuestion(c *gin.Context) {
	var payload struct {
		Category     string   `json:"category"`
		QuestionText string   `json:"questionText"`
		QuestionType string   `json:"questionType"`
		Options      []byte   `json:"options"`
		Weight       *float64 `json:"weight"`
		OrderIndex   int32    `json:"orderIndex"`
		CampaignID   string   `json:"campaignId"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	var campaignID pgtype.UUID
	if payload.CampaignID != "" {
		if id, err := uuid.Parse(payload.CampaignID); err == nil {
			campaignID = pgtype.UUID{Bytes: id, Valid: true}
		}
	}

	question, err := store.CreateQuestion(c, repository.CreateQuestionParams{
		CampaignID:   campaignID,
		Category:     payload.Category,
		QuestionText: payload.QuestionText,
		QuestionType: payload.QuestionType,
		Options:      payload.Options,
		Weight:       numericFromPointer(payload.Weight),
		IsActive:     true,
		OrderIndex:   payload.OrderIndex,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to create question")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    question,
		"message": "Question created successfully",
	})
}

func (h *AdminHandler) UpdateQuestion(c *gin.Context) {
	questionUUID, err := uuid.Parse(c.Param("questionId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid question ID")
		return
	}

	var payload struct {
		Category     *string  `json:"category"`
		QuestionText *string  `json:"questionText"`
		QuestionType *string  `json:"questionType"`
		Options      []byte   `json:"options"`
		Weight       *float64 `json:"weight"`
		OrderIndex   *int32   `json:"orderIndex"`
		IsActive     *bool    `json:"isActive"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	question, err := store.UpdateQuestion(c, repository.UpdateQuestionParams{
		ID:           questionUUID,
		Category:     optionalString(payload.Category),
		QuestionText: optionalString(payload.QuestionText),
		QuestionType: optionalString(payload.QuestionType),
		Options:      payload.Options,
		Weight:       numericFromPointer(payload.Weight),
		IsActive:     boolPointerValue(payload.IsActive),
		Column8:      optionalOrderIndex(payload.OrderIndex),
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update question")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    question,
		"message": "Question updated successfully",
	})
}

func (h *AdminHandler) DeleteQuestion(c *gin.Context) {
	questionUUID, err := uuid.Parse(c.Param("questionId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid question ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	if err := store.DeleteQuestion(c, questionUUID); err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to delete question")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "Question deleted successfully",
	})
}

func (h *AdminHandler) GenerateMatches(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	active, err := store.GetActiveCampaign(c)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load active campaign")
		return
	}
	if active.ID == uuid.Nil {
		respondError(c, http.StatusBadRequest, "No active campaign found")
		return
	}

	matcher := service.NewMatchingService(store)
	created, totalUsers, err := matcher.GenerateAllMatches(c, active.ID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to generate matches")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"matchesCreated": created, "totalUsers": totalUsers},
		"message": "Matches generated successfully",
	})
}

func (h *AdminHandler) GetAllMatches(c *gin.Context) {
	page, limit := parsePagination(c)

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	matches, err := store.ListMatches(c, repository.ListMatchesParams{
		Limit:  int32(limit),
		Offset: int32((page - 1) * limit),
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load matches")
		return
	}
	total, _ := store.CountMatchesAll(c)

	response := make([]gin.H, 0, len(matches))
	for _, match := range matches {
		user1, _ := store.GetUserByID(c, match.User1ID)
		user2, _ := store.GetUserByID(c, match.User2ID)
		response = append(response, gin.H{
			"id":                 match.ID,
			"user1":              user1,
			"user2":              user2,
			"compatibilityScore": numericFloat(match.CompatibilityScore),
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success":    true,
		"data":       response,
		"pagination": paginationPayload(page, limit, total),
	})
}

func (h *AdminHandler) CreateManualMatch(c *gin.Context) {
	var payload struct {
		User1ID            string  `json:"user1Id"`
		User2ID            string  `json:"user2Id"`
		CompatibilityScore float64 `json:"compatibilityScore"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	user1, err := uuid.Parse(payload.User1ID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user1 ID")
		return
	}
	user2, err := uuid.Parse(payload.User2ID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user2 ID")
		return
	}
	if user1 == user2 {
		respondError(c, http.StatusBadRequest, "Cannot match a user with themselves")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	active, _ := store.GetActiveCampaign(c)
	campaignID := pgtype.UUID{Valid: false}
	if active.ID != uuid.Nil {
		campaignID = pgtype.UUID{Bytes: active.ID, Valid: true}
	}

	match, err := store.CreateMatch(c, repository.CreateMatchParams{
		CampaignID:         campaignID,
		User1ID:            user1,
		User2ID:            user2,
		CompatibilityScore: numericFromPointer(&payload.CompatibilityScore),
		MatchTier:          pgtype.Text{String: "perfect", Valid: true},
		SharedInterests:    []byte("{}"),
		RankForUser1:       pgtype.Int4{Valid: false},
		RankForUser2:       pgtype.Int4{Valid: false},
		IsMutualCrush:      false,
		IsRevealed:         false,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to create match")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    match,
		"message": "Match created successfully",
	})
}

func (h *AdminHandler) DeleteMatch(c *gin.Context) {
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

	if err := store.DeleteMatch(c, matchUUID); err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to delete match")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "Match deleted successfully",
	})
}

func (h *AdminHandler) GetEligibleUsers(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	users, err := store.ListEligibleUsers(c)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load users")
		return
	}

	formatted := make([]gin.H, 0, len(users))
	for _, user := range users {
		formatted = append(formatted, gin.H{
			"id":            user.ID,
			"email":         user.Email,
			"firstName":     user.FirstName,
			"lastName":      user.LastName,
			"program":       textValue(user.Program),
			"gender":        textValue(user.Gender),
			"seekingGender": textValue(user.SeekingGender),
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    formatted,
	})
}

func (h *AdminHandler) UpdateSettings(c *gin.Context) {
	var payload struct {
		Key   string      `json:"key"`
		Value interface{} `json:"value"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}
	userID, _ := getUserID(c)
	var updatedBy pgtype.UUID
	if id, err := uuid.Parse(userID); err == nil {
		updatedBy = pgtype.UUID{Bytes: id, Valid: true}
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	valueJSON, _ := json.Marshal(payload.Value)
	setting, err := store.UpsertAdminSetting(c, repository.UpsertAdminSettingParams{
		SettingKey:   payload.Key,
		SettingValue: valueJSON,
		UpdatedBy:    updatedBy,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update setting")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    setting,
		"message": "Setting updated successfully",
	})
}

func (h *AdminHandler) GetTestimonials(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	testimonials, err := store.ListTestimonials(c)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load testimonials")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    testimonials,
	})
}

func (h *AdminHandler) ApproveTestimonial(c *gin.Context) {
	testimonialUUID, err := uuid.Parse(c.Param("testimonialId"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid testimonial ID")
		return
	}

	var payload struct {
		IsApproved  bool `json:"isApproved"`
		IsPublished bool `json:"isPublished"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	updated, err := store.UpdateTestimonialApproval(c, repository.UpdateTestimonialApprovalParams{
		ID:          testimonialUUID,
		IsApproved:  payload.IsApproved,
		IsPublished: payload.IsPublished,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update testimonial")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    updated,
		"message": "Testimonial updated successfully",
	})
}

func parsePagination(c *gin.Context) (int, int) {
	page := 1
	limit := 50

	if value, err := strconv.Atoi(c.DefaultQuery("page", "1")); err == nil && value > 0 {
		page = value
	}
	if value, err := strconv.Atoi(c.DefaultQuery("limit", "50")); err == nil && value > 0 {
		limit = value
	}
	return page, limit
}

func paginationPayload(page, limit int, total int64) gin.H {
	totalPages := 0
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}
	return gin.H{
		"page":       page,
		"limit":      limit,
		"total":      total,
		"totalPages": totalPages,
	}
}

func mapUsers(rows []repository.ListUsersAdminRow) []gin.H {
	data := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		data = append(data, gin.H{
			"id":              row.ID,
			"email":           row.Email,
			"studentId":       textValue(row.StudentID),
			"firstName":       row.FirstName,
			"lastName":        row.LastName,
			"program":         textValue(row.Program),
			"yearLevel":       intValue(row.YearLevel),
			"surveyCompleted": row.SurveyCompleted,
			"isActive":        row.IsActive,
			"createdAt":       row.CreatedAt,
			"lastLogin":       row.LastLogin,
		})
	}
	return data
}

func mapUsersSearch(rows []repository.SearchUsersAdminRow) []gin.H {
	data := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		data = append(data, gin.H{
			"id":              row.ID,
			"email":           row.Email,
			"studentId":       textValue(row.StudentID),
			"firstName":       row.FirstName,
			"lastName":        row.LastName,
			"program":         textValue(row.Program),
			"yearLevel":       intValue(row.YearLevel),
			"surveyCompleted": row.SurveyCompleted,
			"isActive":        row.IsActive,
			"createdAt":       row.CreatedAt,
			"lastLogin":       row.LastLogin,
		})
	}
	return data
}

func boolPointerValue(value *bool) bool {
	if value == nil {
		return false
	}
	return *value
}

func numericFromPointer(value *float64) pgtype.Numeric {
	if value == nil {
		return pgtype.Numeric{Valid: false}
	}
	var numeric pgtype.Numeric
	if err := numeric.Scan(*value); err != nil {
		return pgtype.Numeric{Valid: false}
	}
	return numeric
}

func optionalOrderIndex(value *int32) interface{} {
	if value == nil {
		return nil
	}
	return *value
}
