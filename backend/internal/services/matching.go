package services

import (
	"fmt"
	"log"
	"math"

	"github.com/kurtgav/wizardmatch/backend/internal/database"
	"github.com/kurtgav/wizardmatch/backend/internal/models"
)

func GenerateAllMatches(campaignID string) error {
	log.Printf("Starting matching algorithm for campaign %s", campaignID)

	// Get all users who have completed the survey
	var users []models.User
	if err := database.DB.Where("survey_completed = ? AND is_active = ?", true, true).Find(&users).Error; err != nil {
		return err
	}

	log.Printf("Found %d eligible users for matching", len(users))

	// Generate matches for each user
	for i, user1 := range users {
		// Get user1's survey responses
		var responses1 []models.SurveyResponse
		database.DB.Where("user_id = ?", user1.ID).Find(&responses1)

		// Create a map of user1's responses for quick lookup
		responseMap1 := make(map[string]string)
		for _, r := range responses1 {
			if r.AnswerValue != nil {
				responseMap1[r.QuestionID] = fmt.Sprintf("%d", *r.AnswerValue)
			} else if r.AnswerText != nil {
				responseMap1[r.QuestionID] = *r.AnswerText
			}
		}

		// Compare with other users
		for j := i + 1; j < len(users); j++ {
			user2 := users[j]

			// Skip if genders don't match preferences
			if !isGenderCompatible(user1, user2) {
				continue
			}

			// Get user2's survey responses
			var responses2 []models.SurveyResponse
			database.DB.Where("user_id = ?", user2.ID).Find(&responses2)

			// Calculate compatibility score
			score := calculateCompatibility(responses1, responses2, responseMap1)

			// Only create match if score is above threshold (e.g., 50%)
			if score >= 50.0 {
				tier := getMatchTier(score)
				match := models.Match{
					User1ID:            user1.ID,
					User2ID:            user2.ID,
					CampaignID:         &campaignID,
					CompatibilityScore: score,
					MatchTier:          &tier,
					IsRevealed:         false,
					IsMutualInterest:   false,
				}

				if err := database.DB.Create(&match).Error; err != nil {
					log.Printf("Error creating match: %v", err)
				}
			}
		}
	}

	log.Printf("Matching algorithm completed successfully")
	return nil
}

func isGenderCompatible(user1, user2 models.User) bool {
	// If either user doesn't have gender preferences set, allow the match
	if user1.SeekingGender == nil || user2.SeekingGender == nil {
		return true
	}
	if user1.Gender == nil || user2.Gender == nil {
		return true
	}

	// Check if user1 is seeking user2's gender and vice versa
	seeking1 := *user1.SeekingGender
	seeking2 := *user2.SeekingGender
	gender1 := *user1.Gender
	gender2 := *user2.Gender

	// Handle "Any" preference
	if seeking1 == "Any" || seeking2 == "Any" {
		return true
	}

	// Check mutual compatibility
	return (seeking1 == gender2 || seeking1 == "Any") && (seeking2 == gender1 || seeking2 == "Any")
}

func calculateCompatibility(responses1, responses2 []models.SurveyResponse, responseMap1 map[string]string) float64 {
	if len(responses1) == 0 || len(responses2) == 0 {
		return 0.0
	}

	matchingAnswers := 0
	totalQuestions := 0

	// Compare responses
	for _, r2 := range responses2 {
		var r2Value string
		if r2.AnswerValue != nil {
			r2Value = fmt.Sprintf("%d", *r2.AnswerValue)
		} else if r2.AnswerText != nil {
			r2Value = *r2.AnswerText
		} else {
			continue
		}

		if r1Value, exists := responseMap1[r2.QuestionID]; exists {
			totalQuestions++
			if r1Value == r2Value {
				matchingAnswers++
			}
		}
	}

	if totalQuestions == 0 {
		return 0.0
	}

	// Calculate percentage
	score := (float64(matchingAnswers) / float64(totalQuestions)) * 100.0
	return math.Round(score*100) / 100 // Round to 2 decimal places
}

func getMatchTier(score float64) string {
	if score >= 90 {
		return "Soulmate"
	} else if score >= 80 {
		return "Perfect Match"
	} else if score >= 70 {
		return "Great Match"
	} else if score >= 60 {
		return "Good Match"
	}
	return "Potential Match"
}
