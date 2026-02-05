package http

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"wizardmatch-backend/internal/handler"
	"wizardmatch-backend/internal/middleware"
)

type RouterOptions struct {
	FrontendURL        string
	JwtSecret          string
	AdminEmails        []string
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
}

func NewRouter(options RouterOptions) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Allow localhost for development
			if origin == "http://localhost:3000" ||
				origin == "http://127.0.0.1:3000" ||
				origin == "http://0.0.0.0:3000" {
				return true
			}
			// Allow all Vercel deployments (production and previews)
			if len(origin) > 0 && (origin == "https://wizardmatch.vercel.app" ||
				origin == "https://wizardmatch-frontend.vercel.app" ||
				// Support Vercel preview URLs
				(len(origin) > 11 && origin[len(origin)-11:] == ".vercel.app")) {
				return true
			}
			// Allow the configured frontend URL
			if options.FrontendURL != "" && origin == options.FrontendURL {
				return true
			}
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "Origin"},
		AllowCredentials: true,
	}))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "ok",
			"timestamp":   "now",
			"environment": gin.Mode(),
		})
	})

	authHandler := handler.NewAuthHandler(handler.AuthHandlerOptions{
		JwtSecret:          options.JwtSecret,
		FrontendURL:        options.FrontendURL,
		EnableDevLogin:     true,
		GoogleClientID:     options.GoogleClientID,
		GoogleClientSecret: options.GoogleClientSecret,
		GoogleRedirectURL:  options.GoogleRedirectURL,
		AdminEmails:        options.AdminEmails,
	})

	userHandler := handler.NewUserHandler()
	surveyHandler := handler.NewSurveyHandler()
	matchHandler := handler.NewMatchHandler()
	messageHandler := handler.NewMessageHandler()
	crushHandler := handler.NewCrushHandler()
	campaignHandler := handler.NewCampaignHandler()
	adminHandler := handler.NewAdminHandler()
	analyticsHandler := handler.NewAnalyticsHandler()
	publicHandler := handler.NewPublicHandler()

	authMiddleware := middleware.NewAuthMiddleware(options.JwtSecret)
	adminMiddleware := middleware.NewAdminMiddleware(options.AdminEmails)

	api := router.Group("/api")
	{
		api.GET("/auth/session", authMiddleware.RequireAuth(), authHandler.GetSession)
		api.GET("/auth/google", authHandler.GoogleAuth)
		api.GET("/auth/google/callback", authHandler.GoogleCallback)
		api.POST("/auth/logout", authHandler.Logout)
		api.GET("/auth/dev-login", authHandler.DevLogin)

		api.GET("/users/profile", authMiddleware.RequireAuth(), userHandler.GetProfile)
		api.PUT("/users/profile", authMiddleware.RequireAuth(), userHandler.UpdateProfile)
		api.POST("/users/profile/photo", authMiddleware.RequireAuth(), userHandler.UploadPhoto)
		api.PUT("/users/preferences", authMiddleware.RequireAuth(), userHandler.UpdatePreferences)

		api.GET("/survey/questions", surveyHandler.GetQuestions)
		api.POST("/survey/responses", authMiddleware.RequireAuth(), surveyHandler.SubmitResponse)
		api.GET("/survey/responses", authMiddleware.RequireAuth(), surveyHandler.GetResponses)
		api.POST("/survey/complete", authMiddleware.RequireAuth(), surveyHandler.CompleteSurvey)
		api.GET("/survey/progress", authMiddleware.RequireAuth(), surveyHandler.GetProgress)

		api.GET("/matches", authMiddleware.RequireAuth(), matchHandler.GetMatches)
		api.GET("/matches/potential", authMiddleware.RequireAuth(), matchHandler.GetPotentialMatches)
		api.GET("/matches/:matchId", authMiddleware.RequireAuth(), matchHandler.GetMatchById)
		api.POST("/matches/:matchId/reveal", authMiddleware.RequireAuth(), matchHandler.RevealMatch)
		api.POST("/matches/:matchId/interest", authMiddleware.RequireAuth(), matchHandler.MarkInterest)
		api.POST("/matches/:matchId/report", authMiddleware.RequireAuth(), matchHandler.ReportMatch)
		api.POST("/matches/pass/:targetUserId", authMiddleware.RequireAuth(), matchHandler.PassUser)
		api.POST("/matches/interest/:targetUserId", authMiddleware.RequireAuth(), matchHandler.InterestUser)

		api.GET("/messages/conversations", authMiddleware.RequireAuth(), messageHandler.GetConversations)
		api.GET("/messages/unread-count", authMiddleware.RequireAuth(), messageHandler.GetUnreadCount)
		api.GET("/messages/:matchId", authMiddleware.RequireAuth(), messageHandler.GetMessages)
		api.POST("/messages/send/:matchId", authMiddleware.RequireAuth(), messageHandler.SendMessage)
		api.PUT("/messages/read", authMiddleware.RequireAuth(), messageHandler.MarkAsRead)
		api.POST("/messages/unlock/:campaignId", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), messageHandler.UnlockMessaging)

		api.POST("/crush-list", authMiddleware.RequireAuth(), crushHandler.SubmitCrushList)
		api.GET("/crush-list", authMiddleware.RequireAuth(), crushHandler.GetCrushList)
		api.PUT("/crush-list", authMiddleware.RequireAuth(), crushHandler.UpdateCrushList)
		api.GET("/crush-list/mutual", authMiddleware.RequireAuth(), crushHandler.GetMutualCrushes)
		api.GET("/crush-list/crushed-by", authMiddleware.RequireAuth(), crushHandler.GetCrushedBy)
		api.GET("/crush-list/admin/:campaignId", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), crushHandler.GetCampaignCrushes)

		api.GET("/campaigns/active", campaignHandler.GetActiveCampaign)
		api.GET("/campaigns/active/check-action/:action", campaignHandler.CheckActionAllowed)
		api.GET("/campaigns/:id", authMiddleware.RequireAuth(), campaignHandler.GetCampaignById)
		api.GET("/campaigns/:id/stats", authMiddleware.RequireAuth(), campaignHandler.GetCampaignStats)
		api.GET("/campaigns", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), campaignHandler.ListCampaigns)
		api.POST("/campaigns", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), campaignHandler.CreateCampaign)
		api.PUT("/campaigns/:id", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), campaignHandler.UpdateCampaign)
		api.DELETE("/campaigns/:id", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), campaignHandler.DeleteCampaign)

		api.GET("/admin/stats", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.GetStats)
		api.GET("/admin/users", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.GetUsers)
		api.PUT("/admin/users/:userId", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.UpdateUser)
		api.DELETE("/admin/users/:userId", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.DeleteUser)
		api.POST("/admin/questions", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.CreateQuestion)
		api.PUT("/admin/questions/:questionId", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.UpdateQuestion)
		api.DELETE("/admin/questions/:questionId", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.DeleteQuestion)
		api.POST("/admin/generate-matches", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.GenerateMatches)
		api.GET("/admin/matches", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.GetAllMatches)
		api.POST("/admin/manual-match", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.CreateManualMatch)
		api.DELETE("/admin/matches/:matchId", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.DeleteMatch)
		api.GET("/admin/eligible-users", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.GetEligibleUsers)
		api.PUT("/admin/settings", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.UpdateSettings)
		api.GET("/admin/testimonials", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.GetTestimonials)
		api.PUT("/admin/testimonials/:testimonialId", authMiddleware.RequireAuth(), adminMiddleware.RequireAdmin(), adminHandler.ApproveTestimonial)

		api.GET("/analytics/overview", analyticsHandler.GetOverview)
		api.GET("/analytics/participants", analyticsHandler.GetParticipants)
		api.GET("/analytics/programs", analyticsHandler.GetByProgram)
		api.GET("/analytics/year-levels", analyticsHandler.GetByYearLevel)
		api.GET("/analytics/success-rate", analyticsHandler.GetSuccessRate)

		api.POST("/public/testimonials", publicHandler.CreateTestimonial)
		api.GET("/public/testimonials", publicHandler.ListTestimonials)
		api.GET("/public/stats", publicHandler.GetPublicStats)
	}

	return router
}
