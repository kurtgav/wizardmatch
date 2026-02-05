package handler

import (
	"testing"
	"time"

	"wizardmatch-backend/internal/repository"
)

func TestCampaignPhaseTransitions(t *testing.T) {
	now := time.Now()
	campaign := repository.Campaign{
		SurveyOpenDate:         now.Add(-2 * time.Hour),
		SurveyCloseDate:        now.Add(-1 * time.Hour),
		ProfileUpdateStartDate: now.Add(1 * time.Hour),
		ProfileUpdateEndDate:   now.Add(2 * time.Hour),
		ResultsReleaseDate:     now.Add(4 * time.Hour),
	}

	phase := campaignPhase(campaign)
	if phase != "survey_closed" {
		t.Fatalf("expected survey_closed, got %s", phase)
	}
}
