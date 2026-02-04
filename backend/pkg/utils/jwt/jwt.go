package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/kurtgav/wizardmatch/backend/internal/config"
)

func GenerateToken(userID string, email string) (string, error) {
	claims := jwt.MapClaims{
		"userId": userID,
		"email":  email,
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat":    time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}
