package message

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
)

func GetMessages(c *gin.Context) {
	matchID := c.Param("matchId")
	var messages []models.Message
	if err := database.DB.Where("match_id = ?", matchID).Order("sent_at asc").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    messages,
	})
}

func SendMessage(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var req struct {
		MatchID     string `json:"matchId" binding:"required"`
		RecipientID string `json:"recipientId" binding:"required"`
		Content     string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	msg := models.Message{
		MatchID:     req.MatchID,
		SenderID:    user.ID,
		RecipientID: req.RecipientID,
		Content:     req.Content,
	}

	if err := database.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to send message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    msg,
	})
}
