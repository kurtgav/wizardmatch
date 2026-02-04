package analytics

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
)

func GetOverview(c *gin.Context) {
	var totalParticipants int64
	var completedSurveys int64
	var totalMatches int64
	var mutualMatches int64

	database.DB.Model(&models.User{}).Where("is_active = ?", true).Count(&totalParticipants)
	database.DB.Model(&models.User{}).Where("is_active = ? AND survey_completed = ?", true, true).Count(&completedSurveys)
	database.DB.Model(&models.Match{}).Count(&totalMatches)
	database.DB.Model(&models.Match{}).Where("is_mutual_interest = ?", true).Count(&mutualMatches)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalParticipants": totalParticipants,
			"completedSurveys":  completedSurveys,
			"totalMatches":      totalMatches,
			"mutualMatches":     mutualMatches,
		},
	})
}
