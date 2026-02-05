package config

import (
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Env                string        `mapstructure:"ENV"`
	ServerPort         string        `mapstructure:"SERVER_PORT"`
	DatabaseURL        string        `mapstructure:"DATABASE_URL"`
	JwtSecret          string        `mapstructure:"JWT_SECRET"`
	FrontendURL        string        `mapstructure:"FRONTEND_URL"`
	AdminEmail         string        `mapstructure:"ADMIN_EMAIL"`
	GoogleClientID     string        `mapstructure:"GOOGLE_CLIENT_ID"`
	GoogleClientSecret string        `mapstructure:"GOOGLE_CLIENT_SECRET"`
	GoogleRedirectURL  string        `mapstructure:"GOOGLE_REDIRECT_URL"`
	AccessTokenTTL     time.Duration `mapstructure:"ACCESS_TOKEN_TTL"`
	EnableDevLogin     bool          `mapstructure:"ENABLE_DEV_LOGIN"`
}

func Load() (Config, error) {
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()

	viper.SetDefault("ENV", "development")
	viper.SetDefault("SERVER_PORT", "3001")
	viper.SetDefault("ACCESS_TOKEN_TTL", "24h")
	viper.SetDefault("ENABLE_DEV_LOGIN", true)
	viper.SetDefault("ENV", "development")
	viper.SetDefault("SERVER_PORT", "3001")
	viper.SetDefault("ACCESS_TOKEN_TTL", "24h")
	viper.SetDefault("ENABLE_DEV_LOGIN", true)
	viper.SetDefault("ADMIN_EMAIL", "admin@wizardmatch.ai")

	// Explicitly bind environment variables
	_ = viper.BindEnv("ENV")
	_ = viper.BindEnv("SERVER_PORT")
	_ = viper.BindEnv("DATABASE_URL")
	_ = viper.BindEnv("JWT_SECRET")
	_ = viper.BindEnv("FRONTEND_URL")
	_ = viper.BindEnv("ADMIN_EMAIL")
	_ = viper.BindEnv("GOOGLE_CLIENT_ID")
	_ = viper.BindEnv("GOOGLE_CLIENT_SECRET")
	_ = viper.BindEnv("GOOGLE_REDIRECT_URL")

	_ = viper.ReadInConfig()

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return Config{}, err
	}

	return cfg, nil
}
