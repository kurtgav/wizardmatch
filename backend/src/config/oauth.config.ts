import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './env.config';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const user = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          given_name: profile.name?.givenName,
          family_name: profile.name?.familyName,
        };

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export { passport };
