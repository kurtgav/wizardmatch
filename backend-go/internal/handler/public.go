package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"wizardmatch-backend/internal/repository"
)

type PublicHandler struct{}

func NewPublicHandler() *PublicHandler {
	return &PublicHandler{}
}

func (h *PublicHandler) GetPublicStats(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	stats, err := store.PublicStats(c)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load stats")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalUsers":       stats.TotalUsers,
			"completedSurveys": stats.CompletedSurveys,
			"totalMatches":     stats.TotalMatches,
			"matchReleaseDate": "2026-02-14T00:00:00Z",
		},
	})
}

type createTestimonialRequest struct {
	AuthorName string `json:"authorName"`
	Program    string `json:"program"`
	Title      string `json:"title"`
	Content    string `json:"content"`
}

func (h *PublicHandler) CreateTestimonial(c *gin.Context) {
	var req createTestimonialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}
	if req.AuthorName == "" || req.Content == "" {
		respondError(c, http.StatusBadRequest, "Author name and content are required")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	heading := req.Title
	if heading == "" {
		heading = "Success Story"
	}

	testimonial, err := store.CreateTestimonial(c, repository.CreateTestimonialParams{
		Name:        req.AuthorName,
		Email:       optionalText(&req.Program),
		Heading:     heading,
		Content:     req.Content,
		IsApproved:  false,
		IsPublished: false,
	})
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to submit testimonial")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    testimonial,
		"message": "Testimonial submitted successfully! It will be reviewed before being published.",
	})
}

func (h *PublicHandler) ListTestimonials(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	testimonials, err := store.ListTestimonials(c)
	if err != nil {
		// DEBUG: Return actual error
		respondError(c, http.StatusInternalServerError, "Failed to load testimonials: "+err.Error())
		return
	}

	published := make([]repository.Testimonial, 0)
	for _, t := range testimonials {
		if t.IsPublished {
			published = append(published, t)
		}
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    published,
	})
}
