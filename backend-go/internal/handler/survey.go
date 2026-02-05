package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type SurveyHandler struct{}

func NewSurveyHandler() *SurveyHandler {
	return &SurveyHandler{}
}

func (h *SurveyHandler) GetQuestions(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	questions, err := store.ListQuestions(c)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load questions")
		return
	}

	grouped := map[string][]gin.H{}
	for _, q := range questions {
		entry := gin.H{
			"id":           q.ID,
			"category":     q.Category,
			"questionText": q.QuestionText,
			"questionType": q.QuestionType,
			"options":      jsonRaw(q.Options),
			"orderIndex":   q.OrderIndex,
		}
		grouped[q.Category] = append(grouped[q.Category], entry)
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    grouped,
	})
}

type submitResponseRequest struct {
	QuestionID  string      `json:"questionId"`
	AnswerText  *string     `json:"answerText"`
	AnswerValue *int32      `json:"answerValue"`
	AnswerType  string      `json:"answerType"`
	AnswerJson  interface{} `json:"answerJson"`
}

func (h *SurveyHandler) SubmitResponse(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	var req submitResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	questionUUID, err := uuid.Parse(req.QuestionID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid question ID")
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

	_, err = store.GetQuestionByID(c, questionUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Question not found")
		return
	}

	activeCampaign, _ := store.GetActiveCampaign(c)
	var campaignID pgtype.UUID
	if activeCampaign.ID != uuid.Nil {
		campaignID = pgtype.UUID{Bytes: activeCampaign.ID, Valid: true}
	}

	var answerJSON []byte
	if req.AnswerJson != nil {
		answerJSON, _ = json.Marshal(req.AnswerJson)
	}

	response, err := store.CreateSurveyResponse(c, repository.CreateSurveyResponseParams{
		UserID:      userUUID,
		CampaignID:  campaignID,
		QuestionID:  questionUUID,
		AnswerText:  optionalText(req.AnswerText),
		AnswerValue: optionalInt(req.AnswerValue),
		AnswerJson:  answerJSON,
		AnswerType:  req.AnswerType,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to save response")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    response,
		"message": "Response saved successfully",
	})
}

func (h *SurveyHandler) GetResponses(c *gin.Context) {
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

	responses, err := store.ListSurveyResponsesByUser(c, userUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load responses")
		return
	}

	formatted := make([]gin.H, 0, len(responses))
	for _, r := range responses {
		formatted = append(formatted, gin.H{
			"id":          r.ID,
			"questionId":  r.QuestionID,
			"answerText":  textValue(r.AnswerText),
			"answerValue": intValue(r.AnswerValue),
			"answerType":  r.AnswerType,
			"createdAt":   r.CreatedAt,
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    formatted,
	})
}

func (h *SurveyHandler) CompleteSurvey(c *gin.Context) {
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

	questions, err := store.ListQuestions(c)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load questions")
		return
	}

	responses, err := store.ListSurveyResponsesByUser(c, userUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load responses")
		return
	}

	if len(questions) > 0 && len(responses) < len(questions) {
		respondError(c, http.StatusBadRequest, "Please complete all questions")
		return
	}

	if err := store.SetUserSurveyCompleted(c, repository.SetUserSurveyCompletedParams{
		ID:              userUUID,
		SurveyCompleted: true,
	}); err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to complete survey")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "Survey completed successfully! Your matches are ready.",
	})
}

func (h *SurveyHandler) GetProgress(c *gin.Context) {
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

	questions, err := store.ListQuestions(c)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load questions")
		return
	}
	responses, err := store.ListSurveyResponsesByUser(c, userUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load responses")
		return
	}

	total := len(questions)
	answered := len(responses)
	percentage := 0
	if total > 0 {
		percentage = int(float64(answered) / float64(total) * 100)
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"total":      total,
			"answered":   answered,
			"percentage": percentage,
		},
	})
}
