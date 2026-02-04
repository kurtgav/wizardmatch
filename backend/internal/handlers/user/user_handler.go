package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
)

func GetProfile(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

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

func UpdateProfile(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Map camelCase to snake_case for database columns
	dbUpdateData := make(map[string]interface{})

	// Handle each field with proper mapping
	if val, ok := updateData["username"]; ok {
		dbUpdateData["username"] = val
	}
	if val, ok := updateData["bio"]; ok {
		dbUpdateData["bio"] = val
	}
	if val, ok := updateData["profilePhotoUrl"]; ok {
		dbUpdateData["profile_photo_url"] = val
	}
	if val, ok := updateData["instagramHandle"]; ok {
		dbUpdateData["instagram_handle"] = val
	}
	if val, ok := updateData["facebookProfile"]; ok {
		dbUpdateData["facebook_profile"] = val
	}
	// Removed socialMediaName as requested
	// if val, ok := updateData["socialMediaName"]; ok {
	// 	dbUpdateData["social_media_name"] = val
	// }
	if val, ok := updateData["program"]; ok {
		dbUpdateData["program"] = val
	}
	if val, ok := updateData["yearLevel"]; ok {
		dbUpdateData["year_level"] = val
	}
	if val, ok := updateData["phoneNumber"]; ok {
		dbUpdateData["phone_number"] = val
	}
	if val, ok := updateData["contactPreference"]; ok {
		dbUpdateData["contact_preference"] = val
	}
	if val, ok := updateData["profileVisibility"]; ok {
		dbUpdateData["profile_visibility"] = val
	}
	if val, ok := updateData["gender"]; ok {
		dbUpdateData["gender"] = val
	}
	if val, ok := updateData["seekingGender"]; ok {
		dbUpdateData["seeking_gender"] = val
	}
	if val, ok := updateData["firstName"]; ok {
		dbUpdateData["first_name"] = val
	}
	if val, ok := updateData["lastName"]; ok {
		dbUpdateData["last_name"] = val
	}

	// Update the user in the database
	if err := database.DB.Model(&models.User{}).Where("id = ?", user.ID).Updates(dbUpdateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update profile"})
		return
	}

	// Fetch the updated user
	var updatedUser models.User
	if err := database.DB.First(&updatedUser, "id = ?", user.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch updated profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    updatedUser,
		"message": "Profile updated successfully",
	})
}

func UploadPhoto(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var req struct {
		PhotoURL string `json:"photoUrl" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Photo URL is required"})
		return
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", user.ID).Update("profile_photo_url", req.PhotoURL).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update photo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"id": user.ID, "profilePhotoUrl": req.PhotoURL},
		"message": "Profile photo updated successfully",
	})
}

func UpdatePreferences(c *gin.Context) {
	val, _ := c.Get("user")
	user := val.(models.User)

	var preferences map[string]interface{}
	if err := c.ShouldBindJSON(&preferences); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid preferences data"})
		return
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", user.ID).Update("preferences", preferences).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update preferences"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"id": user.ID, "preferences": preferences},
		"message": "Preferences updated successfully",
	})
}
