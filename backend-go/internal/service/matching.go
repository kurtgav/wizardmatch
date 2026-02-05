package service

import (
	"context"
	"encoding/json"
	"math"
	"sort"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/repository"
)

type MatchingService struct {
	store *repository.Queries
}

func NewMatchingService(store *repository.Queries) *MatchingService {
	return &MatchingService{store: store}
}

type matchScore struct {
	Score     float64
	Breakdown map[string]float64
	IsMutual  bool
	HasCrush  bool
}

var weights = map[string]float64{
	"demographics": 0.10,
	"personality":  0.30,
	"values":       0.25,
	"lifestyle":    0.20,
	"interests":    0.15,
}

func (s *MatchingService) GenerateAllMatches(ctx context.Context, campaignID uuid.UUID) (int, int, error) {
	users, err := s.store.ListEligibleUsers(ctx)
	if err != nil {
		return 0, 0, err
	}

	if err := s.store.DeleteMatchesByCampaign(ctx, pgtype.UUID{Bytes: campaignID, Valid: true}); err != nil {
		return 0, 0, err
	}

	poolGroups := s.groupByPreference(users)
	created := 0

	for _, pool := range poolGroups {
		scored := s.scorePairs(ctx, pool, campaignID)
		sort.Slice(scored, func(i, j int) bool {
			return scored[i].Score.Score > scored[j].Score.Score
		})

		userCounts := map[uuid.UUID]int{}
		for _, pair := range scored {
			if created >= 10000 {
				break
			}
			if userCounts[pair.User1.ID] >= 7 || userCounts[pair.User2.ID] >= 7 {
				continue
			}
			if pair.Score.Score < 50 && !pair.Score.IsMutual {
				continue
			}

			shared, _ := json.Marshal(pair.Score.Breakdown)
			scoreNumeric := toNumeric(pair.Score.Score)
			_, err := s.store.CreateMatch(ctx, repository.CreateMatchParams{
				CampaignID:         pgtype.UUID{Bytes: campaignID, Valid: true},
				User1ID:            pair.User1.ID,
				User2ID:            pair.User2.ID,
				CompatibilityScore: scoreNumeric,
				MatchTier:          pgtype.Text{String: matchTier(pair.Score.Score), Valid: true},
				SharedInterests:    shared,
				RankForUser1:       pgtype.Int4{Int32: int32(userCounts[pair.User1.ID] + 1), Valid: true},
				RankForUser2:       pgtype.Int4{Int32: int32(userCounts[pair.User2.ID] + 1), Valid: true},
				IsMutualCrush:      pair.Score.IsMutual,
				IsRevealed:         false,
			})
			if err != nil {
				continue
			}
			created++
			userCounts[pair.User1.ID]++
			userCounts[pair.User2.ID]++
		}
	}

	if err := s.store.UpdateCampaignStats(ctx, repository.UpdateCampaignStatsParams{
		ID:                    campaignID,
		TotalParticipants:     pgtype.Int4{Int32: int32(len(users)), Valid: true},
		TotalMatchesGenerated: pgtype.Int4{Int32: int32(created), Valid: true},
	}); err != nil {
		return created, len(users), err
	}

	return created, len(users), nil
}

type scoredPair struct {
	User1 repository.ListEligibleUsersRow
	User2 repository.ListEligibleUsersRow
	Score matchScore
}

func (s *MatchingService) scorePairs(ctx context.Context, pool []repository.ListEligibleUsersRow, campaignID uuid.UUID) []scoredPair {
	results := []scoredPair{}
	for i := 0; i < len(pool); i++ {
		for j := i + 1; j < len(pool); j++ {
			user1 := pool[i]
			user2 := pool[j]
			score := s.calculateCompatibility(ctx, user1, user2, campaignID)
			results = append(results, scoredPair{User1: user1, User2: user2, Score: score})
		}
	}
	return results
}

func (s *MatchingService) calculateCompatibility(ctx context.Context, user1 repository.ListEligibleUsersRow, user2 repository.ListEligibleUsersRow, campaignID uuid.UUID) matchScore {
	if !meetsPreferences(user1, user2) {
		return matchScore{Score: 0, Breakdown: baseBreakdown()}
	}

	responses1 := s.responsesByCategory(ctx, user1.ID, campaignID)
	responses2 := s.responsesByCategory(ctx, user2.ID, campaignID)

	demographics := categoryScore(responses1["demographics"], responses2["demographics"], "demographics")
	personality := categoryScore(responses1["personality"], responses2["personality"], "personality")
	values := categoryScore(responses1["values"], responses2["values"], "values")
	lifestyle := categoryScore(responses1["lifestyle"], responses2["lifestyle"], "lifestyle")
	interests := categoryScore(responses1["interests"], responses2["interests"], "interests")

	score := demographics*weights["demographics"] + personality*weights["personality"] + values*weights["values"] + lifestyle*weights["lifestyle"] + interests*weights["interests"]

	bonus, isMutual, hasCrush := s.crushBonus(ctx, user1.ID, user2.ID, campaignID)
	if bonus > 1 {
		score = score * bonus
	}

	if textValue(user1.Program) != "" && textValue(user1.Program) == textValue(user2.Program) {
		score += 2
	}
	if user1.YearLevel.Valid && user2.YearLevel.Valid && absInt(int(user1.YearLevel.Int32)-int(user2.YearLevel.Int32)) <= 1 {
		score += 1
	}

	if score > 100 {
		score = 100
	}

	return matchScore{
		Score: score,
		Breakdown: map[string]float64{
			"demographics": math.Round(demographics),
			"personality":  math.Round(personality),
			"values":       math.Round(values),
			"lifestyle":    math.Round(lifestyle),
			"interests":    math.Round(interests),
		},
		IsMutual: isMutual,
		HasCrush: hasCrush,
	}
}

func (s *MatchingService) responsesByCategory(ctx context.Context, userID uuid.UUID, campaignID uuid.UUID) map[string][]repository.ListSurveyResponsesWithQuestionsByUserCampaignRow {
	rows, _ := s.store.ListSurveyResponsesWithQuestionsByUserCampaign(ctx, repository.ListSurveyResponsesWithQuestionsByUserCampaignParams{
		UserID:     userID,
		CampaignID: pgtype.UUID{Bytes: campaignID, Valid: true},
	})

	grouped := map[string][]repository.ListSurveyResponsesWithQuestionsByUserCampaignRow{}
	for _, row := range rows {
		category := normalizeCategory(row.QuestionCategory)
		grouped[category] = append(grouped[category], row)
	}
	return grouped
}

func (s *MatchingService) crushBonus(ctx context.Context, user1 uuid.UUID, user2 uuid.UUID, campaignID uuid.UUID) (float64, bool, bool) {
	user1Email := s.lookupEmail(ctx, user1)
	user2Email := s.lookupEmail(ctx, user2)
	if user1Email == "" || user2Email == "" {
		return 1, false, false
	}

	count1, _ := s.store.CountCrushByUserEmailCampaign(ctx, repository.CountCrushByUserEmailCampaignParams{
		UserID:     user1,
		CampaignID: campaignID,
		CrushEmail: user2Email,
	})
	count2, _ := s.store.CountCrushByUserEmailCampaign(ctx, repository.CountCrushByUserEmailCampaignParams{
		UserID:     user2,
		CampaignID: campaignID,
		CrushEmail: user1Email,
	})

	if count1 > 0 && count2 > 0 {
		return 1.20, true, true
	}
	if count1 > 0 || count2 > 0 {
		return 1.10, false, true
	}
	return 1, false, false
}

func (s *MatchingService) lookupEmail(ctx context.Context, userID uuid.UUID) string {
	user, err := s.store.GetUserByID(ctx, userID)
	if err != nil {
		return ""
	}
	return user.Email
}

func groupKey(user repository.ListEligibleUsersRow) string {
	seeking := strings.ToLower(textValue(user.SeekingGender))
	if seeking == "" || seeking == "any" {
		return "any"
	}
	return strings.ToLower(textValue(user.Gender)) + "_" + seeking
}

func (s *MatchingService) groupByPreference(users []repository.ListEligibleUsersRow) [][]repository.ListEligibleUsersRow {
	groups := map[string][]repository.ListEligibleUsersRow{}
	for _, user := range users {
		key := groupKey(user)
		groups[key] = append(groups[key], user)
	}

	result := make([][]repository.ListEligibleUsersRow, 0, len(groups))
	for _, group := range groups {
		result = append(result, group)
	}
	return result
}

func meetsPreferences(user1 repository.ListEligibleUsersRow, user2 repository.ListEligibleUsersRow) bool {
	user1Seeking := strings.ToLower(textValue(user1.SeekingGender))
	user2Seeking := strings.ToLower(textValue(user2.SeekingGender))
	user1Gender := strings.ToLower(textValue(user1.Gender))
	user2Gender := strings.ToLower(textValue(user2.Gender))

	if user1Seeking != "" && user1Seeking != "any" {
		if !strings.Contains(user1Seeking, user2Gender) {
			return false
		}
	}
	if user2Seeking != "" && user2Seeking != "any" {
		if !strings.Contains(user2Seeking, user1Gender) {
			return false
		}
	}
	return true
}

func normalizeCategory(category string) string {
	mapping := map[string]string{
		"demographics": "demographics",
		"core_values":  "values",
		"lifestyle":    "lifestyle",
		"personality":  "personality",
		"fun":          "interests",
		"academic":     "interests",
		"interests":    "interests",
		"values":       "values",
	}
	key := strings.ToLower(category)
	if value, ok := mapping[key]; ok {
		return value
	}
	return key
}

func categoryScore(r1 []repository.ListSurveyResponsesWithQuestionsByUserCampaignRow, r2 []repository.ListSurveyResponsesWithQuestionsByUserCampaignRow, category string) float64 {
	if len(r1) == 0 || len(r2) == 0 {
		return 50
	}

	weightSum := 0.0
	weightedScore := 0.0
	for _, resp := range r1 {
		match := findResponse(r2, resp.QuestionID)
		if match == nil {
			continue
		}
		weight := numericFloat(resp.QuestionWeight)
		if weight == 0 {
			weight = 1
		}
		similarity := similarityScore(resp, *match, category)
		weightedScore += similarity * weight
		weightSum += weight
	}

	if weightSum == 0 {
		return 50
	}
	return (weightedScore / weightSum) * 100
}

func similarityScore(r1 repository.ListSurveyResponsesWithQuestionsByUserCampaignRow, r2 repository.ListSurveyResponsesWithQuestionsByUserCampaignRow, category string) float64 {
	answerType := r1.AnswerType
	if answerType == "scale" || answerType == "ranking" {
		if !r1.AnswerValue.Valid || !r2.AnswerValue.Valid {
			return 0.5
		}
		v1 := float64(r1.AnswerValue.Int32)
		v2 := float64(r2.AnswerValue.Int32)
		if category == "personality" || category == "values" {
			return gaussianSimilarity(v1, v2, 1.5)
		}
		return inverseDistance(v1, v2, 10)
	}

	if answerType == "multiple_choice" {
		return exactMatch(textValue(r1.AnswerText), textValue(r2.AnswerText))
	}

	if answerType == "multiple_select" {
		return jaccardSimilarity(listFromJSON(r1.AnswerJson), listFromJSON(r2.AnswerJson))
	}

	return 0.5
}

func gaussianSimilarity(val1 float64, val2 float64, tolerance float64) float64 {
	diff := math.Abs(val1 - val2)
	return math.Exp(-(diff * diff) / (2 * tolerance * tolerance))
}

func inverseDistance(val1 float64, val2 float64, max float64) float64 {
	if max == 0 {
		return 0.5
	}
	return 1 - math.Abs(val1-val2)/max
}

func exactMatch(val1 string, val2 string) float64 {
	if val1 == val2 {
		return 1
	}
	return 0
}

func jaccardSimilarity(set1 []string, set2 []string) float64 {
	if len(set1) == 0 || len(set2) == 0 {
		return 0
	}
	intersection := 0
	set := map[string]struct{}{}
	for _, v := range set1 {
		set[v] = struct{}{}
	}
	union := len(set)
	for _, v := range set2 {
		if _, ok := set[v]; ok {
			intersection++
		} else {
			union++
		}
	}
	if union == 0 {
		return 0
	}
	return float64(intersection) / float64(union)
}

func findResponse(responses []repository.ListSurveyResponsesWithQuestionsByUserCampaignRow, questionID uuid.UUID) *repository.ListSurveyResponsesWithQuestionsByUserCampaignRow {
	for _, r := range responses {
		if r.QuestionID == questionID {
			return &r
		}
	}
	return nil
}

func listFromJSON(value []byte) []string {
	if len(value) == 0 {
		return nil
	}
	var list []string
	_ = json.Unmarshal(value, &list)
	return list
}

func textValue(value pgtype.Text) string {
	if !value.Valid {
		return ""
	}
	return value.String
}

func numericFloat(value pgtype.Numeric) float64 {
	if !value.Valid {
		return 0
	}
	floatValue, err := value.Float64Value()
	if err != nil || !floatValue.Valid {
		return 0
	}
	return floatValue.Float64
}

func baseBreakdown() map[string]float64 {
	return map[string]float64{
		"demographics": 0,
		"personality":  0,
		"values":       0,
		"lifestyle":    0,
		"interests":    0,
	}
}

func matchTier(score float64) string {
	if score >= 95 {
		return "perfect"
	}
	if score >= 85 {
		return "excellent"
	}
	if score >= 75 {
		return "great"
	}
	if score >= 65 {
		return "good"
	}
	return "fair"
}

func toNumeric(score float64) pgtype.Numeric {
	var numeric pgtype.Numeric
	if err := numeric.Scan(score); err != nil {
		return pgtype.Numeric{Valid: false}
	}
	return numeric
}

func absInt(value int) int {
	if value < 0 {
		return -value
	}
	return value
}
