package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/config"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
	"github.com/kurtgav/wizardmatch/backend/pkg/utils/jwt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOauthConfig *oauth2.Config

func InitOAuth() {
	googleOauthConfig = &oauth2.Config{
		RedirectURL:  config.AppConfig.GoogleCallback,
		ClientID:     config.AppConfig.GoogleClientID,
		ClientSecret: config.AppConfig.GoogleSecret,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"},
		Endpoint:     google.Endpoint,
	}
}

func GoogleLogin(c *gin.Context) {
	url := googleOauthConfig.AuthCodeURL("state")
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/login?error=auth_failed&message=%s", config.AppConfig.FrontendURL, "Failed to exchange token"))
		return
	}

	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/login?error=auth_failed&message=%s", config.AppConfig.FrontendURL, "Failed to get user info"))
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID         string `json:"id"`
		Email      string `json:"email"`
		GivenName  string `json:"given_name"`
		FamilyName string `json:"family_name"`
		Picture    string `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/login?error=auth_failed&message=%s", config.AppConfig.FrontendURL, "Failed to decode user info"))
		return
	}

	var user models.User
	result := database.DB.Where("email = ?", googleUser.Email).First(&user)

	newUser := false
	if result.Error != nil {
		// Create user
		newUser = true
		emailLocal := strings.Split(googleUser.Email, "@")[0]
		// Sanitize local part
		reg := strings.NewReplacer(".", "", "-", "", "_", "")
		emailLocal = reg.Replace(emailLocal)

		studentID := fmt.Sprintf("%s%d", emailLocal, rand.Intn(9000)+1000)

		user = models.User{
			Email:           googleUser.Email,
			FirstName:       googleUser.GivenName,
			LastName:        googleUser.FamilyName,
			StudentID:       studentID,
			ProfilePhotoUrl: &googleUser.Picture,
			IsActive:        true,
		}

		if user.FirstName == "" {
			user.FirstName = "Wizard"
		}
		if user.LastName == "" {
			user.LastName = "User"
		}

		if err := database.DB.Create(&user).Error; err != nil {
			c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/login?error=auth_failed&message=%s", config.AppConfig.FrontendURL, "Failed to create user"))
			return
		}
	} else {
		// Update last login
		now := time.Now()
		database.DB.Model(&user).Update("last_login", now)
	}

	jwtToken, err := jwt.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/login?error=auth_failed&message=%s", config.AppConfig.FrontendURL, "Failed to generate token"))
		return
	}

	c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/callback?token=%s&newUser=%t", config.AppConfig.FrontendURL, jwtToken, !user.SurveyCompleted || newUser))
}

func GetSession(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	// Fetch full user details
	var fullUser models.User
	if err := database.DB.First(&fullUser, "id = ?", user.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    fullUser,
	})
}

func Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}

func DevLogin(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		email = "kurtgavin.design@gmail.com"
	}

	var user models.User
	result := database.DB.Where("email = ?", email).First(&user)

	newUser := false
	if result.Error != nil {
		newUser = true
		studentID := fmt.Sprintf("DEV-%d", rand.Intn(9000)+1000)
		user = models.User{
			Email:     email,
			FirstName: "Dev",
			LastName:  "Wizard",
			StudentID: studentID,
			IsActive:  true,
		}
		database.DB.Create(&user)
	}

	jwtToken, _ := jwt.GenerateToken(user.ID, user.Email)
	c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/callback?token=%s&newUser=%t", config.AppConfig.FrontendURL, jwtToken, !user.SurveyCompleted || newUser))
}
