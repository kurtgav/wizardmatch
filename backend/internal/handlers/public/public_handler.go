package public

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
)

func GetTestimonials(c *gin.Context) {
	var testimonials []models.Testimonial
	if err := database.DB.Where("is_published = ?", true).Order("created_at desc").Find(&testimonials).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch testimonials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    testimonials,
	})
}

func CreateTestimonial(c *gin.Context) {
	var req struct {
		AuthorName string `json:"authorName" binding:"required"`
		Program    string `json:"program"`
		Title      string `json:"title"`
		Content    string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Author name and content are required"})
		return
	}

	testimonial := models.Testimonial{
		Name:       req.AuthorName,
		Email:      &req.Program,
		Heading:    req.Title,
		Content:    req.Content,
		IsApproved: false,
	}

	if err := database.DB.Create(&testimonial).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to save testimonial"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Testimonial submitted successfully!",
	})
}
