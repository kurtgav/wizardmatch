package matching

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
)

func GetMatches(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var matches []models.Match
	if err := database.DB.Preload("User1").Preload("User2").
		Where("user1_id = ? OR user2_id = ?", user.ID, user.ID).
		Order("compatibility_score desc").Find(&matches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch matches"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    matches,
	})
}

func RevealMatch(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)
	matchID := c.Param("id")

	var match models.Match
	if err := database.DB.First(&match, "id = ?", matchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Match not found"})
		return
	}

	if match.User1ID != user.ID && match.User2ID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	now := time.Now()
	if err := database.DB.Model(&match).Updates(map[string]interface{}{
		"is_revealed": true,
		"revealed_at": &now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to reveal match"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Match revealed successfully",
	})
}

func SetMutualInterest(c *gin.Context) {
	c.Get("user")
	matchID := c.Param("id")

	var match models.Match
	if err := database.DB.First(&match, "id = ?", matchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Match not found"})
		return
	}

	if err := database.DB.Model(&match).Update("is_mutual_interest", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update interest"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Mutual interest set",
	})
}
