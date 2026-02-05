package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func getUserID(c *gin.Context) (string, bool) {
	value, exists := c.Get("userId")
	if !exists {
		return "", false
	}
	userID, ok := value.(string)
	return userID, ok
}

func getUserEmail(c *gin.Context) (string, bool) {
	value, exists := c.Get("userEmail")
	if !exists {
		return "", false
	}
	email, ok := value.(string)
	return email, ok
}

func respondError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"error":   message,
	})
}

func respondJSON(c *gin.Context, status int, payload gin.H) {
	c.JSON(status, payload)
}

func unauthorized(c *gin.Context) {
	respondError(c, http.StatusUnauthorized, "Authentication required")
}

func textValue(value pgtype.Text) string {
	if !value.Valid {
		return ""
	}
	return value.String
}

func intValue(value pgtype.Int4) int32 {
	if !value.Valid {
		return 0
	}
	return value.Int32
}

func boolValue(value pgtype.Bool) bool {
	if !value.Valid {
		return false
	}
	return value.Bool
}

func uuidValue(value pgtype.UUID) string {
	if !value.Valid {
		return ""
	}
	return uuid.UUID(value.Bytes).String()
}

func numericFloat(value pgtype.Numeric) float64 {
	if !value.Valid {
		return 0
	}
	floatValue, err := value.Float64Value()
	if err != nil || !floatValue.Valid {
		return 0
	}
	return floatValue.Float64
}
