package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type AnalyticsHandler struct{}

func NewAnalyticsHandler() *AnalyticsHandler {
	return &AnalyticsHandler{}
}

func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	activeCampaign, _ := store.GetActiveCampaign(c)
	campaignID := pgtype.UUID{Valid: false}
	if activeCampaign.ID != uuid.Nil {
		campaignID = pgtype.UUID{Bytes: activeCampaign.ID, Valid: true}
	}

	activeUsers, _ := store.CountActiveUsers(c)
	completed := int64(0)
	matches := int64(0)
	mutual := int64(0)
	avgScore := float64(0)
	if campaignID.Valid {
		completed, _ = store.CountCompletedSurveysByCampaign(c, campaignID)
		matches, _ = store.CountMatchesByCampaign(c, campaignID)
		mutual, _ = store.CountMutualMatchesByCampaign(c, campaignID)
		avgScore, _ = store.AverageCompatibilityScoreByCampaign(c, campaignID)
	} else {
		completed, _ = store.CountCompletedSurveys(c)
		matches, _ = store.CountMatches(c)
		mutual, _ = store.CountMutualMatches(c)
		avgScore, _ = store.AverageCompatibilityScore(c)
	}

	var topPrograms []repository.TopProgramsRow
	if campaignID.Valid {
		byCampaign, _ := store.TopProgramsByCampaign(c, repository.TopProgramsByCampaignParams{
			CampaignID: campaignID,
			Limit:      10,
		})
		topPrograms = make([]repository.TopProgramsRow, 0, len(byCampaign))
		for _, row := range byCampaign {
			topPrograms = append(topPrograms, repository.TopProgramsRow{
				Program: row.Program,
				Count:   row.Count,
			})
		}
	} else {
		topPrograms, _ = store.TopPrograms(c, 10)
	}
	programs := make([]gin.H, 0, len(topPrograms))
	for _, row := range topPrograms {
		programs = append(programs, gin.H{
			"program": textValue(row.Program),
			"count":   row.Count,
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalParticipants":         activeUsers,
			"completedSurveys":          completed,
			"totalMatches":              matches,
			"mutualMatches":             mutual,
			"averageCompatibilityScore": avgScore,
			"topPrograms":               programs,
		},
	})
}

func (h *AnalyticsHandler) GetParticipants(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	activeCampaign, _ := store.GetActiveCampaign(c)
	campaignID := pgtype.UUID{Valid: false}
	if activeCampaign.ID != uuid.Nil {
		campaignID = pgtype.UUID{Bytes: activeCampaign.ID, Valid: true}
	}

	activeUsers, _ := store.CountActiveUsers(c)
	completed := int64(0)
	if campaignID.Valid {
		completed, _ = store.CountCompletedSurveysByCampaign(c, campaignID)
	} else {
		completed, _ = store.CountCompletedSurveys(c)
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"total":          activeUsers,
			"completed":      completed,
			"completionRate": percentage(activeUsers, completed),
			"dailySignups":   []gin.H{},
		},
	})
}

func (h *AnalyticsHandler) GetByProgram(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	activeCampaign, _ := store.GetActiveCampaign(c)
	campaignID := pgtype.UUID{Valid: false}
	if activeCampaign.ID != uuid.Nil {
		campaignID = pgtype.UUID{Bytes: activeCampaign.ID, Valid: true}
	}

	var rows []repository.ProgramsWithCompletionRow
	if campaignID.Valid {
		byCampaign, _ := store.ProgramsWithCompletionByCampaign(c, campaignID)
		rows = make([]repository.ProgramsWithCompletionRow, 0, len(byCampaign))
		for _, row := range byCampaign {
			rows = append(rows, repository.ProgramsWithCompletionRow{
				Program:   row.Program,
				Total:     row.Total,
				Completed: row.Completed,
			})
		}
	} else {
		rows, _ = store.ProgramsWithCompletion(c)
	}
	data := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		data = append(data, gin.H{
			"program":        textValue(row.Program),
			"total":          row.Total,
			"completed":      row.Completed,
			"completionRate": percentage(row.Total, row.Completed),
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

func (h *AnalyticsHandler) GetByYearLevel(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	activeCampaign, _ := store.GetActiveCampaign(c)
	campaignID := pgtype.UUID{Valid: false}
	if activeCampaign.ID != uuid.Nil {
		campaignID = pgtype.UUID{Bytes: activeCampaign.ID, Valid: true}
	}

	var rows []repository.YearLevelsWithCompletionRow
	if campaignID.Valid {
		byCampaign, _ := store.YearLevelsWithCompletionByCampaign(c, campaignID)
		rows = make([]repository.YearLevelsWithCompletionRow, 0, len(byCampaign))
		for _, row := range byCampaign {
			rows = append(rows, repository.YearLevelsWithCompletionRow{
				YearLevel: row.YearLevel,
				Total:     row.Total,
				Completed: row.Completed,
			})
		}
	} else {
		rows, _ = store.YearLevelsWithCompletion(c)
	}
	data := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		data = append(data, gin.H{
			"yearLevel":      row.YearLevel.Int32,
			"total":          row.Total,
			"completed":      row.Completed,
			"completionRate": percentage(row.Total, row.Completed),
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

func (h *AnalyticsHandler) GetSuccessRate(c *gin.Context) {
	store := getStore()
	if store == nil {
		respondError(c, http.StatusInternalServerError, "store not initialized")
		return
	}

	activeCampaign, _ := store.GetActiveCampaign(c)
	campaignID := pgtype.UUID{Valid: false}
	if activeCampaign.ID != uuid.Nil {
		campaignID = pgtype.UUID{Bytes: activeCampaign.ID, Valid: true}
	}

	totalMatches := int64(0)
	mutual := int64(0)
	revealed := int64(0)
	if campaignID.Valid {
		totalMatches, _ = store.CountMatchesByCampaign(c, campaignID)
		mutual, _ = store.CountMutualMatchesByCampaign(c, campaignID)
		revealed, _ = store.CountRevealedMatchesByCampaign(c, campaignID)
	} else {
		totalMatches, _ = store.CountMatches(c)
		mutual, _ = store.CountMutualMatches(c)
		revealed, _ = store.CountRevealedMatches(c)
	}

	var rows []repository.MatchesByTierRow
	if campaignID.Valid {
		byCampaign, _ := store.MatchesByTierByCampaign(c, campaignID)
		rows = make([]repository.MatchesByTierRow, 0, len(byCampaign))
		for _, row := range byCampaign {
			rows = append(rows, repository.MatchesByTierRow{
				MatchTier: row.MatchTier,
				Count:     row.Count,
			})
		}
	} else {
		rows, _ = store.MatchesByTier(c)
	}
	tiers := make([]gin.H, 0, len(rows))
	for _, row := range rows {
		tiers = append(tiers, gin.H{
			"tier":  textValue(row.MatchTier),
			"count": row.Count,
		})
	}

	respondJSON(c, http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalMatches":    totalMatches,
			"mutualMatches":   mutual,
			"revealedMatches": revealed,
			"mutualMatchRate": percentage(totalMatches, mutual),
			"revealRate":      percentage(totalMatches, revealed),
			"matchesByTier":   tiers,
		},
	})
}

func percentage(total int64, numerator int64) float64 {
	if total == 0 {
		return 0
	}
	return (float64(numerator) / float64(total)) * 100
}

// no helpers
