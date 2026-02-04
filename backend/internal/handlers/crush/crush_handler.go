package crush

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
)

func GetCrushList(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var list []models.CrushList
	if err := database.DB.Where("user_id = ?", user.ID).Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch crush list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    list,
	})
}

func SubmitCrushList(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var req struct {
		Crushes []struct {
			Email string `json:"email" binding:"required"`
			Name  string `json:"name"`
		} `json:"crushes" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	var activeCampaign models.Campaign
	if err := database.DB.Where("is_active = ?", true).First(&activeCampaign).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "No active campaign found"})
		return
	}

	// Start a transaction
	tx := database.DB.Begin()

	// Delete existing crushes for this user and campaign
	if err := tx.Where("user_id = ? AND campaign_id = ?", user.ID, activeCampaign.ID).Delete(&models.CrushList{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to reset crush list"})
		return
	}

	// Add new crushes
	for _, item := range req.Crushes {
		name := item.Name // Create a copy to take address
		crush := models.CrushList{
			UserID:     user.ID,
			CampaignID: activeCampaign.ID,
			CrushEmail: item.Email,
			CrushName:  &name,
		}

		if err := tx.Create(&crush).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to add crush: " + item.Email})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Transaction failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Crush list submitted successfully",
		"count":   len(req.Crushes),
	})
}
