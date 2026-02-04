package survey

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
	"github.com/kurtgav/wizardmatch/backend/internal/services"
)

func GetQuestions(c *gin.Context) {
	var questions []models.Question
	if err := database.DB.Where("is_active = ?", true).Order("order_index asc").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch questions"})
		return
	}

	grouped := make(map[string][]models.Question)
	for _, q := range questions {
		grouped[q.Category] = append(grouped[q.Category], q)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    grouped,
	})
}

func SubmitResponse(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var req struct {
		QuestionID  string  `json:"questionId" binding:"required"`
		AnswerText  *string `json:"answerText"`
		AnswerValue *int    `json:"answerValue"`
		AnswerType  string  `json:"answerType" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	var activeCampaign models.Campaign
	database.DB.Where("is_active = ?", true).First(&activeCampaign)

	var response models.SurveyResponse
	result := database.DB.Where("user_id = ? AND question_id = ?", user.ID, req.QuestionID).First(&response)

	if result.Error != nil {
		// Create
		response = models.SurveyResponse{
			UserID:      user.ID,
			QuestionID:  req.QuestionID,
			AnswerText:  req.AnswerText,
			AnswerValue: req.AnswerValue,
			AnswerType:  req.AnswerType,
		}
		if activeCampaign.ID != "" {
			response.CampaignID = &activeCampaign.ID
		}
		if err := database.DB.Create(&response).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to save response"})
			return
		}
	} else {
		// Update
		response.AnswerText = req.AnswerText
		response.AnswerValue = req.AnswerValue
		response.AnswerType = req.AnswerType
		if activeCampaign.ID != "" {
			response.CampaignID = &activeCampaign.ID
		}
		database.DB.Save(&response)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
		"message": "Response saved successfully",
	})
}

func GetResponses(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var responses []models.SurveyResponse
	if err := database.DB.Where("user_id = ?", user.ID).Order("created_at asc").Find(&responses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch responses"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    responses,
	})
}

func CompleteSurvey(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var activeCampaign models.Campaign
	database.DB.Where("is_active = ?", true).First(&activeCampaign)

	// Update user status
	if err := database.DB.Model(&user).Update("survey_completed", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update survey status"})
		return
	}

	// Trigger matching (async)
	if activeCampaign.ID != "" {
		go func() {
			log.Printf("Survey completed for user %s. Triggering matching...", user.ID)
			services.GenerateAllMatches(activeCampaign.ID)
		}()
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Survey completed successfully! Your matches are being prepared.",
	})
}

func GetProgress(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var totalQuestions int64
	database.DB.Model(&models.Question{}).Where("is_active = ?", true).Count(&totalQuestions)

	var answeredQuestions int64
	database.DB.Model(&models.SurveyResponse{}).Where("user_id = ?", user.ID).Count(&answeredQuestions)

	percentage := 0
	if totalQuestions > 0 {
		percentage = int((float64(answeredQuestions) / float64(totalQuestions)) * 100)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"total":      totalQuestions,
			"answered":   answeredQuestions,
			"percentage": percentage,
		},
	})
}
