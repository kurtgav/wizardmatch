package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type MessageHandler struct{}

func NewMessageHandler() *MessageHandler {
	return &MessageHandler{}
}

type sendMessageRequest struct {
	Content string `json:"content"`
}

func (h *MessageHandler) SendMessage(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	var req sendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Content == "" {
		respondError(c, http.StatusBadRequest, "Message content cannot be empty")
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

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

	match, err := store.GetMatchByID(c, matchUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Match not found")
		return
	}

	if match.User1ID != userUUID && match.User2ID != userUUID {
		respondError(c, http.StatusForbidden, "You are not part of this match")
		return
	}

	if !match.MessagingUnlocked {
		respondError(c, http.StatusBadRequest, "Messaging is not yet available for this match")
		return
	}

	recipient := match.User1ID
	if recipient == userUUID {
		recipient = match.User2ID
	}

	message, err := store.CreateMessage(c, repository.CreateMessageParams{
		MatchID:     matchUUID,
		SenderID:    userUUID,
		RecipientID: recipient,
		Content:     req.Content,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to send message")
		return
	}

	respondJSON(c, http.StatusCreated, gin.H{
		"success": true,
		"data":    message,
		"message": "Message sent successfully",
	})
}

func (h *MessageHandler) GetMessages(c *gin.Context) {
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

	match, err := store.GetMatchByID(c, matchUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Match not found")
		return
	}
	if match.User1ID != userUUID && match.User2ID != userUUID {
		respondError(c, http.StatusForbidden, "You are not part of this match")
		return
	}
	if !match.MessagingUnlocked {
		respondError(c, http.StatusBadRequest, "Messaging is not yet available for this match")
		return
	}

	messages, err := store.ListMessagesForMatch(c, matchUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load messages")
		return
	}

	formatted := make([]gin.H, 0, len(messages))
	for _, msg := range messages {
		sender, _ := store.GetUserByID(c, msg.SenderID)
		formatted = append(formatted, gin.H{
			"id":       msg.ID,
			"content":  msg.Content,
			"senderId": msg.SenderID,
			"isRead":   msg.IsRead,
			"sentAt":   msg.SentAt,
			"sender": gin.H{
				"id":              sender.ID,
				"firstName":       sender.FirstName,
				"lastName":        sender.LastName,
				"profilePhotoUrl": textValue(sender.ProfilePhotoUrl),
			},
		})
	}

	messageIDs := make([]uuid.UUID, 0, len(messages))
	for _, msg := range messages {
		if msg.RecipientID == userUUID && !msg.IsRead {
			messageIDs = append(messageIDs, msg.ID)
		}
	}
	if len(messageIDs) > 0 {
		_ = store.MarkMessagesRead(c, repository.MarkMessagesReadParams{
			Column1:     messageIDs,
			RecipientID: userUUID,
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    formatted,
		"count":   len(formatted),
	})
}

type markReadRequest struct {
	MessageIds []string `json:"messageIds"`
}

func (h *MessageHandler) MarkAsRead(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	var req markReadRequest
	if err := c.ShouldBindJSON(&req); err != nil || len(req.MessageIds) == 0 {
		respondError(c, http.StatusBadRequest, "Invalid request")
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

	messageIDs := make([]uuid.UUID, 0, len(req.MessageIds))
	for _, id := range req.MessageIds {
		parsed, err := uuid.Parse(id)
		if err != nil {
			continue
		}
		messageIDs = append(messageIDs, parsed)
	}
	if len(messageIDs) == 0 {
		respondError(c, http.StatusBadRequest, "Invalid message IDs")
		return
	}

	if err := store.MarkMessagesRead(c, repository.MarkMessagesReadParams{
		Column1:     messageIDs,
		RecipientID: userUUID,
	}); err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to mark messages as read")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"markedCount": len(messageIDs)},
		"message": "Marked messages as read",
	})
}

func (h *MessageHandler) GetUnreadCount(c *gin.Context) {
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

	count, err := store.CountUnreadMessages(c, userUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to get unread count")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"unreadCount": count},
	})
}

func (h *MessageHandler) GetConversations(c *gin.Context) {
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

	conversations, err := store.ListConversationsForUser(c, userUUID)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load conversations")
		return
	}

	formatted := make([]gin.H, 0, len(conversations))
	for _, msg := range conversations {
		match, err := store.GetMatchByID(c, msg.MatchID)
		if err != nil || !match.MessagingUnlocked {
			continue
		}
		otherID := match.User1ID
		if otherID == userUUID {
			otherID = match.User2ID
		}
		otherUser, _ := store.GetUserByID(c, otherID)

		unreadCount, _ := store.CountUnreadMessagesForMatch(c, repository.CountUnreadMessagesForMatchParams{
			MatchID:     msg.MatchID,
			RecipientID: userUUID,
		})

		formatted = append(formatted, gin.H{
			"matchId": msg.MatchID,
			"match":   match,
			"otherUser": gin.H{
				"id":              otherUser.ID,
				"firstName":       otherUser.FirstName,
				"lastName":        otherUser.LastName,
				"profilePhotoUrl": textValue(otherUser.ProfilePhotoUrl),
			},
			"lastMessage": gin.H{
				"content": msg.Content,
				"sentAt":  msg.SentAt,
			},
			"unreadCount": unreadCount,
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    formatted,
		"count":   len(formatted),
	})
}

func (h *MessageHandler) UnlockMessaging(c *gin.Context) {
	campaignID := c.Param("campaignId")
	campaignUUID, err := uuid.Parse(campaignID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	if err := store.UnlockMessagingByCampaign(c, pgtype.UUID{Bytes: campaignUUID, Valid: true}); err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to unlock messaging")
		return
	}

	count, err := store.CountMatchesByCampaign(c, pgtype.UUID{Bytes: campaignUUID, Valid: true})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load match count")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"unlockedCount": count},
		"message": "Messaging unlocked",
	})
}
