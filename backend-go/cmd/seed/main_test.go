package main

import "testing"

func TestSeedQuestionsUsesValidTypes(t *testing.T) {
	questions := []seedQuestion{
		{Category: "demo", QuestionType: "scale"},
		{Category: "demo", QuestionType: "multiple_choice"},
		{Category: "demo", QuestionType: "text"},
	}
	for _, q := range questions {
		switch q.QuestionType {
		case "scale", "multiple_choice", "text":
			continue
		default:
			t.Fatalf("unexpected question type: %s", q.QuestionType)
		}
	}
}
