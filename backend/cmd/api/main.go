package main

import (
	"log"

	"github.com/kurtgav/wizardmatch/backend/internal/config"
	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/routes"
)

func main() {
	// 1. Load Configuration
	config.LoadConfig()

	// 2. Connect to Database
	database.ConnectDB()

	// 3. Setup Router
	r := routes.SetupRouter()

	// 4. Start Server
	port := config.AppConfig.Port
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
