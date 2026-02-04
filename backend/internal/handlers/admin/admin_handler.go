package admin

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
	"github.com/kurtgav/wizardmatch/backend/internal/services"
)

func GetStats(c *gin.Context) {
	var totalUsers int64
	var completedSurveys int64
	var totalMatches int64
	var activeUsers int64

	database.DB.Model(&models.User{}).Count(&totalUsers)
	database.DB.Model(&models.User{}).Where("survey_completed = ?", true).Count(&completedSurveys)
	database.DB.Model(&models.Match{}).Count(&totalMatches)
	database.DB.Model(&models.User{}).Where("is_active = ?", true).Count(&activeUsers)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalUsers":       totalUsers,
			"completedSurveys": completedSurveys,
			"totalMatches":     totalMatches,
			"activeUsers":      activeUsers,
			"completionRate": func() float64 {
				if totalUsers > 0 {
					return (float64(completedSurveys) / float64(totalUsers)) * 100
				}
				return 0
			}(),
		},
	})
}

func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	search := c.Query("search")

	offset := (page - 1) * limit

	var users []models.User
	var total int64

	query := database.DB.Model(&models.User{})
	if search != "" {
		s := "%" + search + "%"
		query = query.Where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?", s, s, s)
	}

	query.Count(&total)
	query.Offset(offset).Limit(limit).Order("created_at desc").Find(&users)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    users,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func UpdateUser(c *gin.Context) {
	userID := c.Param("userId")
	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "User updated successfully"})
}

func GetPublicStats(c *gin.Context) {
	var totalUsers int64
	var completedSurveys int64
	var totalMatches int64

	database.DB.Model(&models.User{}).Where("is_active = ?", true).Count(&totalUsers)
	database.DB.Model(&models.User{}).Where("is_active = ? AND survey_completed = ?", true, true).Count(&completedSurveys)
	database.DB.Model(&models.Match{}).Count(&totalMatches)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalUsers":       totalUsers,
			"completedSurveys": completedSurveys,
			"totalMatches":     totalMatches,
		},
	})
}

func GenerateMatches(c *gin.Context) {
	// Get the active campaign
	var campaign models.Campaign
	if err := database.DB.Where("is_active = ?", true).First(&campaign).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "No active campaign found"})
		return
	}

	// Run the matching algorithm
	if err := services.GenerateAllMatches(campaign.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to generate matches"})
		return
	}

	// Get the count of matches created
	var matchCount int64
	database.DB.Model(&models.Match{}).Where("campaign_id = ?", campaign.ID).Count(&matchCount)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Matches generated successfully",
		"data": gin.H{
			"matchCount": matchCount,
		},
	})
}

func CreateManualMatch(c *gin.Context) {
	var req struct {
		User1ID            string  `json:"user1Id" binding:"required"`
		User2ID            string  `json:"user2Id" binding:"required"`
		CompatibilityScore float64 `json:"compatibilityScore"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Validate users exist
	var user1, user2 models.User
	if err := database.DB.First(&user1, "id = ?", req.User1ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "User 1 not found"})
		return
	}
	if err := database.DB.First(&user2, "id = ?", req.User2ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "User 2 not found"})
		return
	}

	// Get active campaign
	var campaign models.Campaign
	if err := database.DB.Where("is_active = ?", true).First(&campaign).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "No active campaign found"})
		return
	}

	// Set default score if not provided
	score := req.CompatibilityScore
	if score == 0 {
		score = 100.0 // Default to perfect match for manual matches
	}

	// Determine tier based on score
	tier := "Manual Match"
	if score >= 90 {
		tier = "Soulmate (Manual)"
	} else if score >= 80 {
		tier = "Perfect Match (Manual)"
	}

	// Create the match
	match := models.Match{
		User1ID:            req.User1ID,
		User2ID:            req.User2ID,
		CampaignID:         &campaign.ID,
		CompatibilityScore: score,
		MatchTier:          &tier,
		IsRevealed:         false,
		IsMutualInterest:   false,
	}

	if err := database.DB.Create(&match).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to create match"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Manual match created successfully",
		"data":    match,
	})
}

func GetEligibleUsers(c *gin.Context) {
	var users []models.User
	// Fetch users who are active and have completed the survey (optional: add filter)
	if err := database.DB.Where("is_active = ?", true).Order("first_name asc").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    users,
	})
}

func GetAllMatches(c *gin.Context) {
	var matches []models.Match
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	if err := database.DB.Preload("User1").Preload("User2").Limit(limit).Order("created_at desc").Find(&matches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch matches"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    matches,
	})
}

func GetAllCrushLists(c *gin.Context) {
	var crushLists []models.CrushList
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	// Preload User info
	if err := database.DB.Preload("User").Preload("Campaign").Limit(limit).Order("created_at desc").Find(&crushLists).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch crush lists"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    crushLists,
	})
}
