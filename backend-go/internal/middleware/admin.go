package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type AdminMiddleware struct {
	adminEmails map[string]struct{}
}

func NewAdminMiddleware(adminEmails []string) *AdminMiddleware {
	set := make(map[string]struct{}, len(adminEmails))
	for _, email := range adminEmails {
		normalized := strings.TrimSpace(strings.ToLower(email))
		if normalized == "" {
			continue
		}
		set[normalized] = struct{}{}
	}
	return &AdminMiddleware{adminEmails: set}
}

func (m *AdminMiddleware) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		emailValue, exists := c.Get("userEmail")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Authentication required"})
			c.Abort()
			return
		}

		email, ok := emailValue.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Admin access required"})
			c.Abort()
			return
		}

		if _, ok := m.adminEmails[strings.ToLower(email)]; !ok {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
