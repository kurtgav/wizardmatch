package campaign

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
)

func GetActiveCampaign(c *gin.Context) {
	var campaign models.Campaign
	if err := database.DB.Where("is_active = ?", true).First(&campaign).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "No active campaign found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    campaign,
	})
}
