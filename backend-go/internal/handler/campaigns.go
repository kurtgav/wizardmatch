package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type CampaignHandler struct{}

func NewCampaignHandler() *CampaignHandler {
	return &CampaignHandler{}
}

func (h *CampaignHandler) GetActiveCampaign(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	campaign, err := store.GetActiveCampaign(c)
	if err != nil {
		respondError(c, http.StatusNotFound, "No active campaign found")
		return
	}

	phase := campaignPhase(campaign)
	remaining, label := campaignTimeRemaining(campaign, phase)

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":                     campaign.ID,
			"name":                   campaign.Name,
			"surveyOpenDate":         campaign.SurveyOpenDate,
			"surveyCloseDate":        campaign.SurveyCloseDate,
			"profileUpdateStartDate": campaign.ProfileUpdateStartDate,
			"profileUpdateEndDate":   campaign.ProfileUpdateEndDate,
			"resultsReleaseDate":     campaign.ResultsReleaseDate,
			"isActive":               boolValue(campaign.IsActive),
			"config":                 jsonRaw(campaign.Config),
			"phase":                  phase,
			"timeRemaining":          remaining,
			"nextPhaseLabel":         label,
		},
	})
}

func (h *CampaignHandler) GetCampaignById(c *gin.Context) {
	campaignUUID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	campaign, err := store.GetCampaignByID(c, campaignUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Campaign not found")
		return
	}

	phase := campaignPhase(campaign)
	remaining, label := campaignTimeRemaining(campaign, phase)

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":                     campaign.ID,
			"name":                   campaign.Name,
			"surveyOpenDate":         campaign.SurveyOpenDate,
			"surveyCloseDate":        campaign.SurveyCloseDate,
			"profileUpdateStartDate": campaign.ProfileUpdateStartDate,
			"profileUpdateEndDate":   campaign.ProfileUpdateEndDate,
			"resultsReleaseDate":     campaign.ResultsReleaseDate,
			"isActive":               boolValue(campaign.IsActive),
			"config":                 jsonRaw(campaign.Config),
			"phase":                  phase,
			"timeRemaining":          remaining,
			"nextPhaseLabel":         label,
		},
	})
}

func (h *CampaignHandler) GetCampaignStats(c *gin.Context) {
	campaignUUID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	campaign, err := store.GetCampaignByID(c, campaignUUID)
	if err != nil {
		respondError(c, http.StatusNotFound, "Campaign not found")
		return
	}

	participants, _ := store.CountParticipantsByCampaign(c, pgtype.UUID{Bytes: campaignUUID, Valid: true})
	matches, _ := store.CountMatchesByCampaign(c, pgtype.UUID{Bytes: campaignUUID, Valid: true})
	completed, _ := store.CountCompletedSurveysByCampaign(c, pgtype.UUID{Bytes: campaignUUID, Valid: true})

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"campaign": gin.H{
				"id":                   campaign.ID,
				"name":                 campaign.Name,
				"totalParticipants":    participants,
				"totalMatches":         matches,
				"surveyCompletedCount": completed,
			},
		},
	})
}

type createCampaignRequest struct {
	Name                   string          `json:"name"`
	SurveyOpenDate         string          `json:"surveyOpenDate"`
	SurveyCloseDate        string          `json:"surveyCloseDate"`
	ProfileUpdateStartDate string          `json:"profileUpdateStartDate"`
	ProfileUpdateEndDate   string          `json:"profileUpdateEndDate"`
	ResultsReleaseDate     string          `json:"resultsReleaseDate"`
	Config                 json.RawMessage `json:"config"`
	IsActive               *bool           `json:"isActive"`
}

func (h *CampaignHandler) CreateCampaign(c *gin.Context) {
	var req createCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	params, err := buildCampaignParams(req)
	if err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}

	createParams := repository.CreateCampaignParams{
		Name:                   params.Name,
		SurveyOpenDate:         params.SurveyOpenDate,
		SurveyCloseDate:        params.SurveyCloseDate,
		ProfileUpdateStartDate: params.ProfileUpdateStartDate,
		ProfileUpdateEndDate:   params.ProfileUpdateEndDate,
		ResultsReleaseDate:     params.ResultsReleaseDate,
		IsActive:               pgtype.Bool{Bool: true, Valid: true},
		Config:                 params.Config,
		AlgorithmVersion:       params.AlgorithmVersion,
	}

	campaign, err := store.CreateCampaign(c, createParams)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to create campaign")
		return
	}

	respondJSON(c, http.StatusCreated, gin.H{
		"success": true,
		"data":    campaign,
		"message": "Campaign created successfully",
	})
}

func (h *CampaignHandler) UpdateCampaign(c *gin.Context) {
	campaignUUID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	var req createCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "Invalid request")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	params, err := buildCampaignParams(req)
	if err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	params.ID = campaignUUID

	updated, err := store.UpdateCampaign(c, params)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to update campaign")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    updated,
		"message": "Campaign updated successfully",
	})
}

func (h *CampaignHandler) DeleteCampaign(c *gin.Context) {
	campaignUUID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		respondError(c, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	if err := store.DeleteCampaign(c, campaignUUID); err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to delete campaign")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"message": "Campaign deleted successfully",
	})
}

func (h *CampaignHandler) ListCampaigns(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	campaigns, err := store.ListCampaigns(c)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "Failed to load campaigns")
		return
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    campaigns,
		"count":   len(campaigns),
	})
}

func (h *CampaignHandler) CheckActionAllowed(c *gin.Context) {
	action := c.Param("action")

	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	campaign, err := store.GetActiveCampaign(c)
	if err != nil {
		respondJSON(c, http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"allowed": false,
				"reason":  "No active campaign",
			},
		})
		return
	}

	allowed := actionAllowed(campaignPhase(campaign), action)

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"allowed": allowed,
			"phase":   campaignPhase(campaign),
			"action":  action,
		},
	})
}

func buildCampaignParams(req createCampaignRequest) (repository.UpdateCampaignParams, error) {
	parseDate := func(value string) (time.Time, error) {
		if value == "" {
			return time.Time{}, nil
		}
		return time.Parse(time.RFC3339, value)
	}

	surveyOpen, err := parseDate(req.SurveyOpenDate)
	if err != nil {
		return repository.UpdateCampaignParams{}, err
	}
	surveyClose, err := parseDate(req.SurveyCloseDate)
	if err != nil {
		return repository.UpdateCampaignParams{}, err
	}
	profileStart, err := parseDate(req.ProfileUpdateStartDate)
	if err != nil {
		return repository.UpdateCampaignParams{}, err
	}
	profileEnd, err := parseDate(req.ProfileUpdateEndDate)
	if err != nil {
		return repository.UpdateCampaignParams{}, err
	}
	resultsRelease, err := parseDate(req.ResultsReleaseDate)
	if err != nil {
		return repository.UpdateCampaignParams{}, err
	}

	isActive := pgtype.Bool{Valid: false}
	if req.IsActive != nil {
		isActive = pgtype.Bool{Bool: *req.IsActive, Valid: true}
	}

	config := req.Config
	if len(config) == 0 {
		config = nil
	}

	params := repository.UpdateCampaignParams{
		Name:                   req.Name,
		SurveyOpenDate:         surveyOpen,
		SurveyCloseDate:        surveyClose,
		ProfileUpdateStartDate: profileStart,
		ProfileUpdateEndDate:   profileEnd,
		ResultsReleaseDate:     resultsRelease,
		IsActive:               isActive,
		Config:                 config,
		AlgorithmVersion:       pgtype.Text{Valid: false},
	}

	if params.Name == "" {
		params.Name = " "
	}
	return params, nil
}

func campaignPhase(campaign repository.Campaign) string {
	now := time.Now()
	if now.Before(campaign.SurveyOpenDate) {
		return "pre_launch"
	}
	if now.Before(campaign.SurveyCloseDate) {
		return "survey_open"
	}
	if now.Before(campaign.ProfileUpdateStartDate) {
		return "survey_closed"
	}
	if now.Before(campaign.ProfileUpdateEndDate) {
		return "profile_update"
	}
	return "results_released"
}

func actionAllowed(phase string, action string) bool {
	permissions := map[string]map[string]bool{
		"view_landing": {
			"pre_launch":       true,
			"survey_open":      true,
			"survey_closed":    true,
			"profile_update":   true,
			"results_released": true,
		},
		"sign_up": {
			"survey_open": true,
		},
		"take_survey": {
			"survey_open": true,
		},
		"edit_survey": {
			"survey_open": true,
		},
		"submit_crush_list": {
			"survey_open": true,
		},
		"edit_profile": {
			"survey_open":    true,
			"profile_update": true,
		},
		"view_matches": {
			"profile_update":   true,
			"results_released": true,
		},
		"send_messages": {
			"profile_update":   true,
			"results_released": true,
		},
	}

	if phasePermissions, ok := permissions[action]; ok {
		return phasePermissions[phase]
	}
	return false
}

func campaignTimeRemaining(campaign repository.Campaign, phase string) (int64, string) {
	now := time.Now()
	var target time.Time
	var label string

	switch phase {
	case "pre_launch":
		target = campaign.SurveyOpenDate
		label = "Until survey opens"
	case "survey_open":
		target = campaign.SurveyCloseDate
		label = "Until survey closes"
	case "survey_closed":
		target = campaign.ProfileUpdateStartDate
		label = "Until profile update period"
	case "profile_update":
		target = campaign.ResultsReleaseDate
		label = "Until results reveal"
	default:
		target = campaign.ResultsReleaseDate
		label = "Results revealed!"
	}

	remaining := target.Sub(now)
	if remaining < 0 {
		return 0, label
	}
	return int64(remaining / time.Millisecond), label
}
