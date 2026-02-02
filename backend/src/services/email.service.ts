import nodemailer from 'nodemailer';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';

// Create transporter
const transporter = nodemailer.createTransport({
  service: config.emailService,
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});

export const emailService = {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await transporter.sendMail({
        from: `"Perfect Match" <${config.emailUser}>`,
        to,
        subject,
        html,
      });

      logger.info('Email sent:', { messageId: info.messageId });
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  },

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #E52037; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #E52037; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Perfect Match! 💕</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName}!</p>
            <p>Welcome to Mapúa MCL Perfect Match! We're thrilled to have you join our community of Cardinals looking for meaningful connections.</p>
            <p>Here's what happens next:</p>
            <ol>
              <li>Complete the compatibility survey (takes about 15-20 minutes)</li>
              <li>Wait for match release on February 5, 2026</li>
              <li>Discover your top 10 most compatible matches</li>
              <li>Reach out and start connecting!</li>
            </ol>
            <p>Ready to find your match? Click the button below to start the survey!</p>
            <a href="${config.frontendUrl}/survey" class="button">Start Survey</a>
            <p>Questions? Check out our FAQ or reply to this email.</p>
            <p>Good luck!</p>
            <p>The Perfect Match Team</p>
          </div>
          <div class="footer">
            <p>© 2026 Mapúa MCL Perfect Match. All rights reserved.</p>
            <p>perfectmatch@mcl.edu.ph</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Welcome to Perfect Match! 🎉', html);
  },

  async matchReleaseEmail(email: string, firstName: string, matchCount: number): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E52037, #FF6B9D); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Matches Are Here! 💕</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName}!</p>
            <p>Exciting news! Your Perfect Matches have been released!</p>
            <p>You have <strong>${matchCount}</strong> compatible matches waiting for you. Log in now to see who you matched with!</p>
            <a href="${config.frontendUrl}/matches" class="button">View My Matches</a>
            <p>Remember, your matches are ranked by compatibility, so start from the top and work your way down!</p>
            <p>Good luck and have fun!</p>
            <p>The Perfect Match Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Your Perfect Matches are here! 💕', html);
  },

  async surveyReminderEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #E52037; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #E52037; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Don't Miss Out! ⏰</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName}!</p>
            <p>You started the Perfect Match survey but haven't finished it yet. Don't miss your chance to find your matches!</p>
            <p>The survey takes about 15-20 minutes to complete and your answers will help us find your most compatible matches.</p>
            <a href="${config.frontendUrl}/survey" class="button">Complete Survey</a>
            <p>Matches will be released on February 5, 2026. Make sure you complete the survey before then!</p>
            <p>The Perfect Match Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Complete your Perfect Match survey!', html);
  },
};
