package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
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

	user, err := store.GetUserByID(c, userUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "User not found")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":                user.ID,
			"email":             user.Email,
			"firstName":         user.FirstName,
			"lastName":          user.LastName,
			"studentId":         textValue(user.StudentID),
			"program":           textValue(user.Program),
			"yearLevel":         intValue(user.YearLevel),
			"gender":            textValue(user.Gender),
			"bio":               textValue(user.Bio),
			"profilePhotoUrl":   textValue(user.ProfilePhotoUrl),
			"username":          textValue(user.Username),
			"instagramHandle":   textValue(user.InstagramHandle),
			"facebookProfile":   textValue(user.FacebookProfile),
			"socialMediaName":   textValue(user.SocialMediaName),
			"phoneNumber":       textValue(user.PhoneNumber),
			"contactPreference": textValue(user.ContactPreference),
			"profileVisibility": user.ProfileVisibility,
			"surveyCompleted":   user.SurveyCompleted,
			"preferences":       jsonRaw(user.Preferences),
			"createdAt":         user.CreatedAt,
		},
	})
}

type updateProfileRequest struct {
	Username          *string `json:"username"`
	FirstName         *string `json:"firstName"`
	LastName          *string `json:"lastName"`
	Program           *string `json:"program"`
	YearLevel         *int32  `json:"yearLevel"`
	Gender            *string `json:"gender"`
	Bio               *string `json:"bio"`
	InstagramHandle   *string `json:"instagramHandle"`
	FacebookProfile   *string `json:"facebookProfile"`
	SocialMediaName   *string `json:"socialMediaName"`
	PhoneNumber       *string `json:"phoneNumber"`
	ContactPreference *string `json:"contactPreference"`
	ProfileVisibility *string `json:"profileVisibility"`
	ProfilePhotoUrl   *string `json:"profilePhotoUrl"`
	SeekingGender     *string `json:"seekingGender"`
	DateOfBirth       *string `json:"dateOfBirth"`
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
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

	params := repository.UpdateUserProfileParams{
		ID:                userUUID,
		Column2:           optionalString(req.FirstName),
		Column3:           optionalString(req.LastName),
		Program:           optionalText(req.Program),
		YearLevel:         optionalInt(req.YearLevel),
		Gender:            optionalText(req.Gender),
		SeekingGender:     optionalText(req.SeekingGender),
		DateOfBirth:       optionalDate(req.DateOfBirth),
		ProfilePhotoUrl:   optionalText(req.ProfilePhotoUrl),
		Bio:               optionalText(req.Bio),
		InstagramHandle:   optionalText(req.InstagramHandle),
		FacebookProfile:   optionalText(req.FacebookProfile),
		SocialMediaName:   optionalText(req.SocialMediaName),
		PhoneNumber:       optionalText(req.PhoneNumber),
		ContactPreference: optionalText(req.ContactPreference),
		Column16:          optionalString(req.ProfileVisibility),
		Preferences:       nil,
	}

	user, err := store.UpdateUserProfile(c, params)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update profile")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":                user.ID,
			"username":          textValue(user.Username),
			"firstName":         user.FirstName,
			"lastName":          user.LastName,
			"program":           textValue(user.Program),
			"yearLevel":         intValue(user.YearLevel),
			"gender":            textValue(user.Gender),
			"bio":               textValue(user.Bio),
			"profilePhotoUrl":   textValue(user.ProfilePhotoUrl),
			"instagramHandle":   textValue(user.InstagramHandle),
			"facebookProfile":   textValue(user.FacebookProfile),
			"socialMediaName":   textValue(user.SocialMediaName),
			"phoneNumber":       textValue(user.PhoneNumber),
			"contactPreference": textValue(user.ContactPreference),
			"profileVisibility": user.ProfileVisibility,
		},
		"message": "Profile updated successfully",
	})
}

func (h *UserHandler) UploadPhoto(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	var req struct {
		PhotoUrl string `json:"photoUrl"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.PhotoUrl == "" {
		respondError(c, http.StatusBadRequest, "Photo URL is required")
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

	updated, err := store.UpdateUserPhoto(c, repository.UpdateUserPhotoParams{
		ID:              userUUID,
		ProfilePhotoUrl: pgtype.Text{String: req.PhotoUrl, Valid: true},
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update photo")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":              updated.ID,
			"profilePhotoUrl": textValue(updated.ProfilePhotoUrl),
		},
		"message": "Profile photo updated successfully",
	})
}

func (h *UserHandler) UpdatePreferences(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		unauthorized(c)
		return
	}

	var prefs map[string]interface{}
	if err := c.ShouldBindJSON(&prefs); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid preferences")
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	payload, _ := json.Marshal(prefs)

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	updated, err := store.UpdateUserPreferences(c, repository.UpdateUserPreferencesParams{
		ID:          userUUID,
		Preferences: payload,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update preferences")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":          updated.ID,
			"preferences": json.RawMessage(updated.Preferences),
		},
		"message": "Preferences updated successfully",
	})
}

func jsonRaw(value []byte) json.RawMessage {
	if len(value) == 0 {
		return json.RawMessage("{}")
	}
	return json.RawMessage(value)
}

func optionalText(value *string) pgtype.Text {
	if value == nil {
		return pgtype.Text{Valid: false}
	}
	return pgtype.Text{String: *value, Valid: true}
}

func optionalInt(value *int32) pgtype.Int4 {
	if value == nil {
		return pgtype.Int4{Valid: false}
	}
	return pgtype.Int4{Int32: *value, Valid: true}
}

func optionalDate(value *string) pgtype.Date {
	if value == nil || *value == "" {
		return pgtype.Date{Valid: false}
	}
	parsed, err := time.Parse("2006-01-02", *value)
	if err != nil {
		return pgtype.Date{Valid: false}
	}
	return pgtype.Date{Time: parsed, Valid: true}
}

func optionalString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
