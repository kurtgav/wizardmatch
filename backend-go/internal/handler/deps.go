package handler

import (
	"wizardmatch-backend/internal/db"
	"wizardmatch-backend/internal/repository"
)

var store *repository.Queries

func SetDependencies(database *db.DB) {
	if database == nil {
		store = nil
		return
	}
	store = repository.New(database.Pool)
}

func getStore() *repository.Queries {
	return store
}
