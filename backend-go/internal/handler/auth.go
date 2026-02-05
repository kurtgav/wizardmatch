package handler

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type AuthHandlerOptions struct {
	JwtSecret          string
	FrontendURL        string
	EnableDevLogin     bool
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
}

type AuthHandler struct {
	jwtSecret          []byte
	frontendURL        string
	enableDevLogin     bool
	googleClientID     string
	googleClientSecret string
	googleRedirectURL  string
}

type googleUser struct {
	ID         string `json:"id"`
	Email      string `json:"email"`
	GivenName  string `json:"given_name"`
	FamilyName string `json:"family_name"`
}

func NewAuthHandler(options AuthHandlerOptions) *AuthHandler {
	return &AuthHandler{
		jwtSecret:          []byte(options.JwtSecret),
		frontendURL:        options.FrontendURL,
		enableDevLogin:     options.EnableDevLogin,
		googleClientID:     options.GoogleClientID,
		googleClientSecret: options.GoogleClientSecret,
		googleRedirectURL:  options.GoogleRedirectURL,
	}
}

func (h *AuthHandler) GoogleAuth(c *gin.Context) {
	clientID := h.googleClientID
	redirectURL := h.googleRedirectURL
	if clientID == "" || redirectURL == "" {
		respondError(c, http.StatusInternalServerError, "Google OAuth not configured")
		return
	}

	query := url.Values{}
	query.Set("client_id", clientID)
	query.Set("redirect_uri", redirectURL)
	query.Set("response_type", "code")
	query.Set("scope", "profile email")
	query.Set("access_type", "offline")
	state := randomState()
	query.Set("state", state)

	googleURL := "https://accounts.google.com/o/oauth2/v2/auth?" + query.Encode()
	c.Redirect(http.StatusFound, googleURL)
}

func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.Redirect(http.StatusFound, h.frontendURL+"/auth/login?error=auth_failed")
		return
	}

	tokenResp, err := h.exchangeGoogleToken(code, c)
	if err != nil {
		c.Redirect(http.StatusFound, h.frontendURL+"/auth/login?error=auth_failed")
		return
	}

	user, err := h.fetchGoogleUser(tokenResp.AccessToken)
	if err != nil || user.Email == "" {
		c.Redirect(http.StatusFound, h.frontendURL+"/auth/login?error=auth_failed")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	existing, err := store.GetUserByEmail(c, user.Email)
	newUser := false

	if err != nil || existing.ID == uuid.Nil {
		studentID := generateStudentID(user.Email)
		created, err := store.CreateUser(c, repository.CreateUserParams{
			Email:             user.Email,
			GoogleID:          pgtype.Text{String: user.ID, Valid: user.ID != ""},
			StudentID:         pgtype.Text{String: studentID, Valid: studentID != ""},
			FirstName:         defaultString(user.GivenName, "Wizard"),
			LastName:          defaultString(user.FamilyName, "User"),
			Program:           pgtype.Text{String: "Undeclared", Valid: true},
			YearLevel:         pgtype.Int4{Int32: 1, Valid: true},
			ProfileVisibility: "Matches Only",
			IsActive:          true,
			SurveyCompleted:   false,
		})
		if err != nil {
			respondError(c, http.StatusInternalServerError, "failed to create user")
			return
		}
		existing = created
		newUser = true
	}

	token, err := h.generateJWT(existing.ID, existing.Email)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to generate token")
		return
	}

	redirectURL := h.frontendURL + "/auth/callback?token=" + url.QueryEscape(token) + "&newUser=" + boolToString(!existing.SurveyCompleted || newUser)
	c.Redirect(http.StatusFound, redirectURL)
}

func (h *AuthHandler) GetSession(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := store.GetUserByID(c, userUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "User not found")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":              user.ID,
			"email":           user.Email,
			"firstName":       user.FirstName,
			"lastName":        user.LastName,
			"program":         textValue(user.Program),
			"yearLevel":       intValue(user.YearLevel),
			"surveyCompleted": user.SurveyCompleted,
			"profilePhotoUrl": textValue(user.ProfilePhotoUrl),
			"bio":             textValue(user.Bio),
		},
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}

func (h *AuthHandler) DevLogin(c *gin.Context) {
	if !h.enableDevLogin {
		respondError(c, http.StatusForbidden, "Dev login disabled")
		return
	}

	email := c.DefaultQuery("email", "dev@wizardmatch.ai")
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	user, err := store.GetUserByEmail(c, email)
	if err != nil || user.ID == uuid.Nil {
		created, err := store.CreateUser(c, repository.CreateUserParams{
			Email:             email,
			StudentID:         pgtype.Text{String: "DEV-0001", Valid: true},
			FirstName:         "Dev",
			LastName:          "Wizard",
			Program:           pgtype.Text{String: "Computer Science", Valid: true},
			YearLevel:         pgtype.Int4{Int32: 3, Valid: true},
			ProfileVisibility: "Matches Only",
			IsActive:          true,
			SurveyCompleted:   false,
		})
		if err != nil {
			respondError(c, http.StatusInternalServerError, "failed to create user")
			return
		}
		user = created
	}

	token, err := h.generateJWT(user.ID, user.Email)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to generate token")
		return
	}

	redirectURL := h.frontendURL + "/auth/callback?token=" + url.QueryEscape(token) + "&newUser=" + boolToString(!user.SurveyCompleted)
	c.Redirect(http.StatusFound, redirectURL)
}

type tokenResponse struct {
	AccessToken string `json:"access_token"`
}

func (h *AuthHandler) exchangeGoogleToken(code string, c *gin.Context) (*tokenResponse, error) {
	tokenEndpoint := "https://oauth2.googleapis.com/token"
	values := url.Values{}
	values.Set("code", code)
	values.Set("client_id", h.googleClientID)
	values.Set("client_secret", h.googleClientSecret)
	values.Set("redirect_uri", h.googleRedirectURL)
	values.Set("grant_type", "authorization_code")

	resp, err := http.PostForm(tokenEndpoint, values)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, err
	}

	var token tokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return nil, err
	}

	return &token, nil
}

func (h *AuthHandler) fetchGoogleUser(accessToken string) (*googleUser, error) {
	req, err := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, err
	}

	var user googleUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (h *AuthHandler) generateJWT(userID uuid.UUID, email string) (string, error) {
	claims := jwt.MapClaims{
		"userId": userID.String(),
		"email":  email,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(h.jwtSecret)
}

func randomState() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

func generateStudentID(email string) string {
	at := strings.Split(email, "@")
	prefix := at[0]
	if len(prefix) > 10 {
		prefix = prefix[:10]
	}
	return prefix + randomNumericSuffix(4)
}

func randomNumericSuffix(length int) string {
	if length <= 0 {
		return ""
	}
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		for i := range b {
			b[i] = byte('0' + i%10)
		}
		return string(b)
	}
	for i := range b {
		b[i] = '0' + (b[i] % 10)
	}
	return string(b)
}

func boolToString(value bool) string {
	if value {
		return "true"
	}
	return "false"
}

func defaultString(value string, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}
