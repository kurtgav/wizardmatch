package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"wizardmatch-backend/internal/config"
	"wizardmatch-backend/internal/db"
	"wizardmatch-backend/internal/repository"
)

type seedQuestion struct {
	Category     string
	QuestionText string
	QuestionType string
	Options      any
	Weight       float64
}

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

	store := repository.New(database.Pool)

	campaign, err := ensureActiveCampaign(ctx, store)
	if err != nil {
		log.Fatalf("failed to ensure campaign: %v", err)
	}

	if err := seedQuestions(ctx, store, campaign.ID); err != nil {
		log.Fatalf("failed to seed questions: %v", err)
	}

	if err := seedUsers(ctx, store); err != nil {
		log.Fatalf("failed to seed users: %v", err)
	}

	if err := seedResponses(ctx, store, campaign.ID); err != nil {
		log.Fatalf("failed to seed responses: %v", err)
	}

	fmt.Println("Seed complete")
}

func ensureActiveCampaign(ctx context.Context, store *repository.Queries) (repository.Campaign, error) {
	existing, err := store.GetActiveCampaign(ctx)
	if err == nil && existing.ID != uuid.Nil {
		return existing, nil
	}

	now := time.Now().UTC()
	surveyOpen := now.Add(-24 * time.Hour)
	surveyClose := now.Add(24 * time.Hour)
	profileStart := now.Add(25 * time.Hour)
	profileEnd := now.Add(48 * time.Hour)
	resultsRelease := now.Add(72 * time.Hour)

	campaign, err := store.CreateCampaign(ctx, repository.CreateCampaignParams{
		Name:                   "Local Dev Campaign",
		SurveyOpenDate:         surveyOpen,
		SurveyCloseDate:        surveyClose,
		ProfileUpdateStartDate: profileStart,
		ProfileUpdateEndDate:   profileEnd,
		ResultsReleaseDate:     resultsRelease,
		IsActive:               pgtype.Bool{Bool: true, Valid: true},
		Config:                 []byte("{}"),
		AlgorithmVersion:       pgtype.Text{String: "v1", Valid: true},
	})
	if err != nil {
		return repository.Campaign{}, err
	}
	return campaign, nil
}

func seedQuestions(ctx context.Context, store *repository.Queries, campaignID uuid.UUID) error {
	questionsExisting, err := store.ListQuestions(ctx)
	if err == nil && len(questionsExisting) > 0 {
		return nil
	}

	questions := []seedQuestion{
		{
			Category:     "demographics",
			QuestionText: "What year level are you currently in?",
			QuestionType: "scale",
			Options: map[string]any{
				"min": 1,
				"max": 5,
				"labels": map[string]string{
					"1": "First year",
					"5": "Fifth year",
				},
			},
			Weight: 0.6,
		},
		{
			Category:     "demographics",
			QuestionText: "Which program best describes you?",
			QuestionType: "multiple_choice",
			Options: []string{
				"Computer Science",
				"Information Technology",
				"Business Administration",
				"Psychology",
				"Engineering",
				"Multimedia Arts",
			},
			Weight: 0.7,
		},
		{
			Category:     "personality",
			QuestionText: "I feel energized after social gatherings.",
			QuestionType: "scale",
			Options: map[string]any{
				"min": 1,
				"max": 5,
				"labels": map[string]string{
					"1": "Strongly disagree",
					"5": "Strongly agree",
				},
			},
			Weight: 1.0,
		},
		{
			Category:     "personality",
			QuestionText: "I enjoy trying new things spontaneously.",
			QuestionType: "scale",
			Options: map[string]any{
				"min": 1,
				"max": 5,
				"labels": map[string]string{
					"1": "Not me",
					"5": "Very me",
				},
			},
			Weight: 1.0,
		},
		{
			Category:     "values",
			QuestionText: "What matters most in a relationship?",
			QuestionType: "multiple_choice",
			Options: []string{
				"Trust",
				"Shared goals",
				"Sense of humor",
				"Emotional support",
				"Adventure",
			},
			Weight: 1.0,
		},
		{
			Category:     "values",
			QuestionText: "I value consistent communication.",
			QuestionType: "scale",
			Options: map[string]any{
				"min": 1,
				"max": 5,
				"labels": map[string]string{
					"1": "Not important",
					"5": "Very important",
				},
			},
			Weight: 1.0,
		},
		{
			Category:     "lifestyle",
			QuestionText: "What is your ideal weekend?",
			QuestionType: "multiple_choice",
			Options: []string{
				"Quiet study or self-care",
				"Hanging out with close friends",
				"Campus events",
				"Outdoor adventure",
				"Creative projects",
			},
			Weight: 0.9,
		},
		{
			Category:     "lifestyle",
			QuestionText: "How late do you usually sleep?",
			QuestionType: "scale",
			Options: map[string]any{
				"min": 1,
				"max": 5,
				"labels": map[string]string{
					"1": "Before 10pm",
					"5": "After 2am",
				},
			},
			Weight: 0.8,
		},
		{
			Category:     "interests",
			QuestionText: "Pick a vibe that sounds fun.",
			QuestionType: "multiple_choice",
			Options: []string{
				"Coffee and deep talks",
				"Game night",
				"Art museum date",
				"Sports fest",
				"Food crawl",
			},
			Weight: 0.8,
		},
		{
			Category:     "interests",
			QuestionText: "Favorite creative outlet?",
			QuestionType: "multiple_choice",
			Options: []string{
				"Music",
				"Design",
				"Writing",
				"Photography",
				"Dance",
			},
			Weight: 0.8,
		},
	}

	order := int32(1)
	for _, q := range questions {
		optionsJSON, err := json.Marshal(q.Options)
		if err != nil {
			return err
		}
		weight := pgtype.Numeric{}
		if err := weight.Scan(q.Weight); err != nil {
			return err
		}

		_, err = store.CreateQuestion(ctx, repository.CreateQuestionParams{
			CampaignID:   pgtype.UUID{Bytes: campaignID, Valid: true},
			Category:     q.Category,
			QuestionText: q.QuestionText,
			QuestionType: q.QuestionType,
			Options:      optionsJSON,
			Weight:       weight,
			IsActive:     true,
			OrderIndex:   order,
		})
		if err != nil {
			return err
		}
		order++
	}
	return nil
}

func seedUsers(ctx context.Context, store *repository.Queries) error {
	users := []struct {
		Email     string
		FirstName string
		LastName  string
		Program   string
		YearLevel int32
		Gender    string
		Seeking   string
	}{
		{"admin@wizardmatch.ai", "Admin", "Wizard", "Computer Science", 4, "female", "any"},
		{"dev1@wizardmatch.ai", "Avery", "Lee", "Information Technology", 3, "male", "female"},
		{"dev2@wizardmatch.ai", "Jamie", "Cruz", "Business Administration", 2, "female", "male"},
		{"dev3@wizardmatch.ai", "Riley", "Santos", "Engineering", 1, "male", "female"},
	}

	for _, u := range users {
		_, err := store.GetUserByEmail(ctx, u.Email)
		if err == nil {
			continue
		}

		_, err = store.CreateUser(ctx, repository.CreateUserParams{
			Email:             u.Email,
			GoogleID:          pgtype.Text{Valid: false},
			Username:          pgtype.Text{String: u.Email, Valid: true},
			StudentID:         pgtype.Text{String: "DEV-" + u.Email, Valid: true},
			FirstName:         u.FirstName,
			LastName:          u.LastName,
			Program:           pgtype.Text{String: u.Program, Valid: true},
			YearLevel:         pgtype.Int4{Int32: u.YearLevel, Valid: true},
			Gender:            pgtype.Text{String: u.Gender, Valid: true},
			SeekingGender:     pgtype.Text{String: u.Seeking, Valid: true},
			DateOfBirth:       pgtype.Date{Valid: false},
			ProfilePhotoUrl:   pgtype.Text{Valid: false},
			Bio:               pgtype.Text{String: "Local seed user.", Valid: true},
			InstagramHandle:   pgtype.Text{Valid: false},
			FacebookProfile:   pgtype.Text{Valid: false},
			SocialMediaName:   pgtype.Text{Valid: false},
			PhoneNumber:       pgtype.Text{Valid: false},
			ContactPreference: pgtype.Text{String: "email", Valid: true},
			ProfileVisibility: "Matches Only",
			Preferences:       []byte("{}"),
			LastLogin:         pgtype.Timestamptz{Valid: false},
			IsActive:          true,
			SurveyCompleted:   false,
		})
		if err != nil {
			return fmt.Errorf("seed user %s: %w", u.Email, err)
		}
	}
	return nil
}

func seedResponses(ctx context.Context, store *repository.Queries, campaignID uuid.UUID) error {
	questions, err := store.ListQuestions(ctx)
	if err != nil {
		return err
	}
	if len(questions) == 0 {
		return nil
	}

	seedEmails := []string{"dev1@wizardmatch.ai", "dev2@wizardmatch.ai", "dev3@wizardmatch.ai"}
	users := make([]repository.User, 0, len(seedEmails))
	for _, email := range seedEmails {
		user, err := store.GetUserByEmail(ctx, email)
		if err != nil {
			continue
		}
		users = append(users, user)
	}
	if len(users) == 0 {
		return nil
	}

	for _, user := range users {
		responses, err := store.ListSurveyResponsesByUser(ctx, user.ID)
		if err == nil && len(responses) > 0 {
			continue
		}

		for _, q := range questions {
			params := repository.CreateSurveyResponseParams{
				UserID:     user.ID,
				CampaignID: pgtype.UUID{Bytes: campaignID, Valid: true},
				QuestionID: q.ID,
				AnswerType: q.QuestionType,
			}

			switch q.QuestionType {
			case "scale":
				value := int32(3)
				params.AnswerValue = pgtype.Int4{Int32: value, Valid: true}
			case "multiple_choice":
				var options []string
				_ = json.Unmarshal(q.Options, &options)
				if len(options) == 0 {
					params.AnswerText = pgtype.Text{String: "", Valid: false}
					break
				}
				params.AnswerText = pgtype.Text{String: options[0], Valid: true}
			case "text":
				params.AnswerText = pgtype.Text{String: "Looking forward to matching!", Valid: true}
			default:
				params.AnswerText = pgtype.Text{String: "", Valid: false}
			}

			if _, err := store.CreateSurveyResponse(ctx, params); err != nil {
				return err
			}
		}

		if err := store.SetUserSurveyCompleted(ctx, repository.SetUserSurveyCompletedParams{
			ID:              user.ID,
			SurveyCompleted: true,
		}); err != nil {
			return err
		}
	}

	return nil
}

func init() {
	if os.Getenv("TZ") == "" {
		_ = os.Setenv("TZ", "UTC")
	}
}
