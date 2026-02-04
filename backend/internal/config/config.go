package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	JWTSecret      string
	FrontendURL    string
	GoogleClientID string
	GoogleSecret   string
	GoogleCallback string
	Environment    string
	APIPrefix      string
}

var AppConfig *Config

func LoadConfig() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	AppConfig = &Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    getEnv("DATABASE_URL", ""),
		JWTSecret:      getEnv("JWT_SECRET", "changeme"),
		FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:3000"),
		GoogleClientID: getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleSecret:   getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleCallback: getEnv("GOOGLE_CALLBACK_URL", ""),
		Environment:    getEnv("NODE_ENV", "development"),
		APIPrefix:      getEnv("API_PREFIX", "/api"),
	}

	if AppConfig.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
