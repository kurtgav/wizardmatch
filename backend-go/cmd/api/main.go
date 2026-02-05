package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"wizardmatch-backend/internal/config"
	"wizardmatch-backend/internal/db"
	"wizardmatch-backend/internal/handler"
	internalhttp "wizardmatch-backend/internal/http"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load failed: %v", err)
	}

	ctx := context.Background()
	database, err := db.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer database.Close()

	handler.SetDependencies(database)

	router := internalhttp.NewRouter(internalhttp.RouterOptions{
		FrontendURL:        cfg.FrontendURL,
		JwtSecret:          cfg.JwtSecret,
		AdminEmails:        []string{"kurtgavin.design@gmail.com", "nicolemaaba@gmail.com", "Agpfrancisco1@gmail.com"},
		GoogleClientID:     cfg.GoogleClientID,
		GoogleClientSecret: cfg.GoogleClientSecret,
		GoogleRedirectURL:  cfg.GoogleRedirectURL,
	})

	server := &http.Server{
		Addr:              ":" + cfg.ServerPort,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server failed: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown failed: %v", err)
	}
}
