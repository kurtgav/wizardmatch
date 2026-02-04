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

func AddCrush(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var req struct {
		CrushEmail string `json:"crushEmail" binding:"required"`
		CrushName  string `json:"crushName"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	var activeCampaign models.Campaign
	database.DB.Where("is_active = ?", true).First(&activeCampaign)

	crush := models.CrushList{
		UserID:     user.ID,
		CampaignID: activeCampaign.ID,
		CrushEmail: req.CrushEmail,
		CrushName:  &req.CrushName,
	}

	if err := database.DB.Create(&crush).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to add crush"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    crush,
		"message": "Crush added successfully",
	})
}
