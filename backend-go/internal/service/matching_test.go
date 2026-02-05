package service

import "testing"

func TestMatchTier(t *testing.T) {
	if matchTier(96) != "perfect" {
		t.Fatalf("expected perfect tier")
	}
	if matchTier(86) != "excellent" {
		t.Fatalf("expected excellent tier")
	}
	if matchTier(76) != "great" {
		t.Fatalf("expected great tier")
	}
	if matchTier(66) != "good" {
		t.Fatalf("expected good tier")
	}
	if matchTier(50) != "fair" {
		t.Fatalf("expected fair tier")
	}
}
