package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/kurtgav/wizardmatch/backend/internal/config"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/admin"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/analytics"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/auth"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/campaign"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/crush"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/matching"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/message"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/public"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/survey"
	"github.com/kurtgav/wizardmatch/backend/internal/handlers/user"
	"github.com/kurtgav/wizardmatch/backend/internal/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	auth.InitOAuth()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "env": config.AppConfig.Environment})
	})

	api := r.Group(config.AppConfig.APIPrefix)
	{
		// Auth
		authGroup := api.Group("/auth")
		{
			authGroup.GET("/google", auth.GoogleLogin)
			authGroup.GET("/google/callback", auth.GoogleCallback)
			authGroup.GET("/session", middleware.Authenticate(), auth.GetSession)
			authGroup.POST("/logout", auth.Logout)
			authGroup.GET("/dev-login", auth.DevLogin)
		}

		// Public
		api.GET("/public/stats", admin.GetPublicStats)
		api.GET("/public/testimonials", public.GetTestimonials)
		api.POST("/public/testimonials", public.CreateTestimonial)

		// Authenticated Routes
		authRequired := api.Group("/")
		authRequired.Use(middleware.Authenticate())
		{
			// Users
			userGroup := authRequired.Group("/users")
			{
				userGroup.GET("/profile", user.GetProfile)
				userGroup.PUT("/profile", user.UpdateProfile)
				userGroup.POST("/profile/photo", user.UploadPhoto)
				userGroup.PUT("/preferences", user.UpdatePreferences)
			}

			// Survey
			surveyGroup := authRequired.Group("/survey")
			{
				surveyGroup.GET("/questions", survey.GetQuestions)
				surveyGroup.POST("/responses", survey.SubmitResponse)
				surveyGroup.GET("/responses", survey.GetResponses)
				surveyGroup.POST("/complete", survey.CompleteSurvey)
				surveyGroup.GET("/progress", survey.GetProgress)
			}

			// Matching
			matchingGroup := authRequired.Group("/matches")
			{
				matchingGroup.GET("/", matching.GetMatches)
				matchingGroup.POST("/reveal/:id", matching.RevealMatch)
				matchingGroup.POST("/interest/:id", matching.SetMutualInterest)
			}

			// Crush
			crushGroup := authRequired.Group("/crush-list")
			{
				crushGroup.GET("/", crush.GetCrushList)
				crushGroup.POST("/", crush.SubmitCrushList)
			}

			// Messages
			messageGroup := authRequired.Group("/messages")
			{
				messageGroup.GET("/:matchId", message.GetMessages)
				messageGroup.POST("/send", message.SendMessage)
			}

			// Campaign
			api.GET("/campaigns/active", campaign.GetActiveCampaign)

			// Analytics (Admin usually, but placing here for now)
			analyticsGroup := authRequired.Group("/analytics")
			{
				analyticsGroup.GET("/overview", analytics.GetOverview)
			}
		}

		// Admin Routes
		adminGroup := api.Group("/admin")
		adminGroup.Use(middleware.Authenticate(), middleware.RequireAdmin())
		{
			adminGroup.GET("/stats", admin.GetStats)
			adminGroup.GET("/users", admin.GetUsers)
			adminGroup.PUT("/users/:userId", admin.UpdateUser)
			adminGroup.GET("/eligible-users", admin.GetEligibleUsers)
			adminGroup.GET("/matches", admin.GetAllMatches)
			adminGroup.POST("/generate-matches", admin.GenerateMatches)
			adminGroup.POST("/manual-match", admin.CreateManualMatch)
			adminGroup.GET("/crush-lists", admin.GetAllCrushLists)
		}
	}

	return r
}
