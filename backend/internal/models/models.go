package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// No custom JSONMap needed, using json.RawMessage

// Campaign Model
type Campaign struct {
	ID                     string           `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name                   string           `json:"name"`
	SurveyOpenDate         time.Time        `gorm:"column:survey_open_date" json:"surveyOpenDate"`
	SurveyCloseDate        time.Time        `gorm:"column:survey_close_date" json:"surveyCloseDate"`
	ProfileUpdateStartDate time.Time        `gorm:"column:profile_update_start_date" json:"profileUpdateStartDate"`
	ProfileUpdateEndDate   time.Time        `gorm:"column:profile_update_end_date" json:"profileUpdateEndDate"`
	ResultsReleaseDate     time.Time        `gorm:"column:results_release_date" json:"resultsReleaseDate"`
	IsActive               bool             `gorm:"default:true;column:is_active" json:"isActive"`
	TotalParticipants      int              `gorm:"default:0;column:total_participants" json:"totalParticipants"`
	TotalMatchesGenerated  int              `gorm:"default:0;column:total_matches_generated" json:"totalMatchesGenerated"`
	AlgorithmVersion       *string          `gorm:"column:algorithm_version" json:"algorithmVersion"`
	Config                 json.RawMessage  `gorm:"type:jsonb" json:"config"`
	CreatedAt              time.Time        `gorm:"default:now();column:created_at" json:"createdAt"`
	Questions              []Question       `gorm:"foreignKey:CampaignID" json:"questions,omitempty"`
	SurveyResponses        []SurveyResponse `gorm:"foreignKey:CampaignID" json:"surveyResponses,omitempty"`
	CrushLists             []CrushList      `gorm:"foreignKey:CampaignID" json:"crushLists,omitempty"`
	Matches                []Match          `gorm:"foreignKey:CampaignID" json:"matches,omitempty"`
}

func (Campaign) TableName() string {
	return "campaigns"
}

func (m *Campaign) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// User Model
type User struct {
	ID                string           `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Email             string           `gorm:"uniqueIndex;not null" json:"email"`
	Username          *string          `gorm:"unique" json:"username"`
	StudentID         string           `gorm:"index;column:student_id" json:"studentId"`
	FirstName         string           `gorm:"column:first_name" json:"firstName"`
	LastName          string           `gorm:"column:last_name" json:"lastName"`
	Program           *string          `json:"program"`
	YearLevel         *int             `gorm:"column:year_level" json:"yearLevel"`
	Gender            *string          `json:"gender"`
	SeekingGender     *string          `gorm:"column:seeking_gender" json:"seekingGender"`
	DateOfBirth       *time.Time       `gorm:"column:date_of_birth" json:"dateOfBirth"`
	ProfilePhotoUrl   *string          `gorm:"column:profile_photo_url" json:"profilePhotoUrl"`
	Bio               *string          `gorm:"type:text" json:"bio"`
	InstagramHandle   *string          `gorm:"column:instagram_handle" json:"instagramHandle"`
	FacebookProfile   *string          `gorm:"column:facebook_profile" json:"facebookProfile"`
	SocialMediaName   *string          `gorm:"column:social_media_name" json:"socialMediaName"`
	PhoneNumber       *string          `gorm:"column:phone_number" json:"phoneNumber"`
	ContactPreference *string          `gorm:"column:contact_preference" json:"contactPreference"`
	ProfileVisibility string           `gorm:"default:'Matches Only';column:profile_visibility" json:"profileVisibility"`
	Preferences       json.RawMessage  `gorm:"type:jsonb" json:"preferences"`
	CreatedAt         time.Time        `gorm:"default:now();column:created_at" json:"createdAt"`
	UpdatedAt         time.Time        `gorm:"autoUpdateTime;column:updated_at" json:"updatedAt"`
	LastLogin         *time.Time       `gorm:"column:last_login" json:"lastLogin"`
	IsActive          bool             `gorm:"default:true;column:is_active" json:"isActive"`
	SurveyCompleted   bool             `gorm:"default:false;column:survey_completed" json:"surveyCompleted"`
	SurveyResponses   []SurveyResponse `gorm:"foreignKey:UserID" json:"surveyResponses,omitempty"`
	CrushLists        []CrushList      `gorm:"foreignKey:UserID" json:"crushLists,omitempty"`
	MatchesAsUser1    []Match          `gorm:"foreignKey:User1ID" json:"matchesAsUser1,omitempty"`
	MatchesAsUser2    []Match          `gorm:"foreignKey:User2ID" json:"matchesAsUser2,omitempty"`
}

func (User) TableName() string {
	return "users"
}

func (m *User) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// Question Model
type Question struct {
	ID           string          `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	CampaignID   *string         `gorm:"column:campaign_id" json:"campaignId"`
	Category     string          `json:"category"`
	QuestionText string          `gorm:"column:question_text" json:"questionText"`
	QuestionType string          `gorm:"column:question_type" json:"questionType"`
	Options      json.RawMessage `gorm:"type:jsonb" json:"options"`
	Weight       float64         `gorm:"default:1.00;type:decimal(3,2)" json:"weight"`
	IsActive     bool            `gorm:"default:true;column:is_active" json:"isActive"`
	OrderIndex   int             `gorm:"column:order_index" json:"orderIndex"`
	CreatedAt    time.Time       `gorm:"default:now();column:created_at" json:"createdAt"`
}

func (Question) TableName() string {
	return "questions"
}

func (m *Question) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// SurveyResponse Model
type SurveyResponse struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID      string    `gorm:"column:user_id;not null" json:"userId"`
	CampaignID  *string   `gorm:"column:campaign_id" json:"campaignId"`
	QuestionID  string    `gorm:"column:question_id;not null" json:"questionId"`
	AnswerText  *string   `gorm:"column:answer_text;type:text" json:"answerText"`
	AnswerValue *int      `gorm:"column:answer_value" json:"answerValue"`
	AnswerType  string    `gorm:"column:answer_type" json:"answerType"`
	CreatedAt   time.Time `gorm:"default:now();column:created_at" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updatedAt"`
}

func (SurveyResponse) TableName() string {
	return "survey_responses"
}

func (m *SurveyResponse) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// Match Model
type Match struct {
	ID                 string          `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	CampaignID         *string         `gorm:"column:campaign_id" json:"campaignId"`
	User1ID            string          `gorm:"column:user1_id;not null" json:"user1Id"`
	User2ID            string          `gorm:"column:user2_id;not null" json:"user2Id"`
	CompatibilityScore float64         `gorm:"column:compatibility_score;type:decimal(5,2)" json:"compatibilityScore"`
	MatchTier          *string         `gorm:"column:match_tier" json:"matchTier"`
	SharedInterests    json.RawMessage `gorm:"type:jsonb;column:shared_interests" json:"sharedInterests"`
	RankForUser1       *int            `gorm:"column:rank_for_user1" json:"rankForUser1"`
	RankForUser2       *int            `gorm:"column:rank_for_user2" json:"rankForUser2"`
	IsRevealed         bool            `gorm:"default:false;column:is_revealed" json:"isRevealed"`
	IsMutualInterest   bool            `gorm:"default:false;column:is_mutual_interest" json:"isMutualInterest"`
	IsMutualCrush      bool            `gorm:"default:false;column:is_mutual_crush" json:"isMutualCrush"`
	MessagingUnlocked  bool            `gorm:"default:false;column:messaging_unlocked" json:"messagingUnlocked"`
	CreatedAt          time.Time       `gorm:"default:now();column:created_at" json:"createdAt"`
	RevealedAt         *time.Time      `gorm:"column:revealed_at" json:"revealedAt"`
	User1              *User           `gorm:"foreignKey:User1ID" json:"user1,omitempty"`
	User2              *User           `gorm:"foreignKey:User2ID" json:"user2,omitempty"`
	Messages           []Message       `gorm:"foreignKey:MatchID" json:"messages,omitempty"`
}

func (Match) TableName() string {
	return "matches"
}

func (m *Match) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// Interaction Model
type Interaction struct {
	ID              string          `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	MatchID         string          `gorm:"column:match_id;not null" json:"matchId"`
	UserID          string          `gorm:"column:user_id;not null" json:"userId"`
	InteractionType string          `gorm:"column:interaction_type" json:"interactionType"`
	Metadata        json.RawMessage `gorm:"type:jsonb" json:"metadata"`
	CreatedAt       time.Time       `gorm:"default:now();column:created_at" json:"createdAt"`
}

func (Interaction) TableName() string {
	return "interactions"
}

func (m *Interaction) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// Message Model
type Message struct {
	ID          string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	MatchID     string     `gorm:"column:match_id;not null" json:"matchId"`
	SenderID    string     `gorm:"column:sender_id;not null" json:"senderId"`
	RecipientID string     `gorm:"column:recipient_id;not null" json:"recipientId"`
	Content     string     `gorm:"type:text" json:"content"`
	IsRead      bool       `gorm:"default:false;column:is_read" json:"isRead"`
	SentAt      time.Time  `gorm:"default:now();column:sent_at" json:"sentAt"`
	ReadAt      *time.Time `gorm:"column:read_at" json:"readAt"`
}

func (Message) TableName() string {
	return "messages"
}

func (m *Message) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// CrushList Model
type CrushList struct {
	ID         string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID     string    `gorm:"column:user_id;not null" json:"userId"`
	CampaignID string    `gorm:"column:campaign_id;not null" json:"campaignId"`
	CrushEmail string    `gorm:"column:crush_email;not null" json:"crushEmail"`
	CrushName  *string   `gorm:"column:crush_name" json:"crushName"`
	IsMatched  bool      `gorm:"default:false;column:is_matched" json:"isMatched"`
	IsMutual   bool      `gorm:"default:false;column:is_mutual" json:"isMutual"`
	NudgeSent  bool      `gorm:"default:false;column:nudge_sent" json:"nudgeSent"`
	CreatedAt  time.Time `gorm:"default:now();column:created_at" json:"createdAt"`
}

func (CrushList) TableName() string {
	return "crush_lists"
}

func (m *CrushList) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// AdminSetting Model
type AdminSetting struct {
	ID           string          `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	SettingKey   string          `gorm:"unique;column:setting_key" json:"settingKey"`
	SettingValue json.RawMessage `gorm:"type:jsonb;column:setting_value" json:"settingValue"`
	UpdatedAt    time.Time       `gorm:"autoUpdateTime;column:updated_at" json:"updatedAt"`
	UpdatedBy    *string         `gorm:"column:updated_by" json:"updatedBy"`
}

func (AdminSetting) TableName() string {
	return "admin_settings"
}

func (m *AdminSetting) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// Testimonial Model
type Testimonial struct {
	ID          string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name        string    `json:"name"`
	Email       *string   `json:"email"`
	Heading     string    `json:"heading"`
	Content     string    `gorm:"type:text" json:"content"`
	IsApproved  bool      `gorm:"default:false;column:is_approved" json:"isApproved"`
	IsPublished bool      `gorm:"default:false;column:is_published" json:"isPublished"`
	CreatedAt   time.Time `gorm:"default:now();column:created_at" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime;column:updated_at" json:"updatedAt"`
}

func (Testimonial) TableName() string {
	return "testimonials"
}

func (m *Testimonial) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}
