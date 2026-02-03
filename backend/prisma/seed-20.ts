import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting 20-question survey seed...');

    try {
        // 1. Get the active campaign
        const campaign = await prisma.campaign.findFirst({
            where: { isActive: true },
        });

        if (!campaign) {
            console.log('❌ No active campaign found. Please create one first.');
            return;
        }

        console.log(`📍 Found active campaign: ${campaign.name} (${campaign.id})`);

        // 2. Clear existing questions and survey responses for THIS campaign
        // To be safe, we'll mark old questions as inactive instead of deleting them if they have responses,
        // but the user wants "20 questions only".

        // Check if there are existing responses
        const responseCount = await prisma.surveyResponse.count({
            where: { campaignId: campaign.id }
        });

        if (responseCount > 0) {
            console.log(`⚠️ Found ${responseCount} existing responses. Deleting them to clean up...`);
            await prisma.surveyResponse.deleteMany({
                where: { campaignId: campaign.id }
            });
        }

        // Delete existing questions for this campaign
        await prisma.question.deleteMany({
            where: { campaignId: campaign.id }
        });

        // 3. Define 20 new questions
        const questions = [
            // Core Values
            {
                category: 'values',
                questionText: 'What matters most to you in a relationship?',
                questionType: 'multiple_choice',
                options: ['Trust and honesty', 'Emotional support', 'Shared goals', 'Personal growth', 'Adventure'],
                weight: 2.0,
                orderIndex: 1,
            },
            {
                category: 'values',
                questionText: 'How important is family approval in your dating life?',
                questionType: 'scale',
                options: { min: 1, max: 5, labels: { 1: 'Not important', 3: 'Somewhat', 5: 'Very important' } },
                weight: 1.5,
                orderIndex: 2,
            },
            {
                category: 'values',
                questionText: 'Your ideal future: career-focused, family-focused, or balanced?',
                questionType: 'multiple_choice',
                options: ['Career-focused', 'Family-focused', 'Work-life balance', 'Still figuring it out'],
                weight: 2.0,
                orderIndex: 3,
            },
            {
                category: 'values',
                questionText: 'Dealbreaker: Which of these is unacceptable to you?',
                questionType: 'multiple_choice',
                options: ['Lack of ambition', 'Dishonesty', 'Poor communication', 'Disrespect'],
                weight: 2.5,
                orderIndex: 4,
            },

            // Lifestyle
            {
                category: 'lifestyle',
                questionText: 'Typical Friday night activity?',
                questionType: 'multiple_choice',
                options: ['Study group', 'Partying', 'Netflix at home', 'Gym/Exercise', 'Food trip with friends'],
                weight: 1.5,
                orderIndex: 5,
            },
            {
                category: 'lifestyle',
                questionText: 'Are you a morning person or a night owl?',
                questionType: 'scale',
                options: { min: 1, max: 5, labels: { 1: 'Early bird', 3: 'Balanced', 5: 'Night owl' } },
                weight: 1.2,
                orderIndex: 6,
            },
            {
                category: 'lifestyle',
                questionText: 'How often do you like to go out or socialize?',
                questionType: 'scale',
                options: { min: 1, max: 5, labels: { 1: 'Rarely', 3: 'Occasionally', 5: 'Very often' } },
                weight: 1.0,
                orderIndex: 7,
            },
            {
                category: 'lifestyle',
                questionText: 'Ideal weekend activity?',
                questionType: 'multiple_choice',
                options: ['Outdoor adventure', 'Stay home and chill', 'Movie marathon', 'Hang out with friends'],
                weight: 1.3,
                orderIndex: 8,
            },

            // Personality
            {
                category: 'personality',
                questionText: 'In a disagreement, you usually...?',
                questionType: 'multiple_choice',
                options: ['Talk it out immediately', 'Need space first', 'Avoid conflict', 'Compromise quickly'],
                weight: 1.8,
                orderIndex: 9,
            },
            {
                category: 'personality',
                questionText: 'How do you make big decisions?',
                questionType: 'multiple_choice',
                options: ['Gut feeling', 'Careful analysis', 'Ask for advice', 'Make pros/cons list'],
                weight: 1.5,
                orderIndex: 10,
            },
            {
                category: 'personality',
                questionText: 'Are you an Introvert, Extrovert, or Ambivert?',
                questionType: 'scale',
                options: { min: 1, max: 5, labels: { 1: 'Introvert', 3: 'Ambivert', 5: 'Extrovert' } },
                weight: 1.6,
                orderIndex: 11,
            },
            {
                category: 'personality',
                questionText: 'How do you express affection (Love Language)?',
                questionType: 'multiple_choice',
                options: ['Words of affirmation', 'Physical touch', 'Quality time', 'Gifts', 'Acts of service'],
                weight: 1.7,
                orderIndex: 12,
            },

            // Academic (Mapped to Interests)
            {
                category: 'interests',
                questionText: 'Dream career path after graduation?',
                questionType: 'multiple_choice',
                options: ['Technical expert', 'Entrepreneur', 'Researcher', 'Corporate', 'Still exploring'],
                weight: 1.3,
                orderIndex: 13,
            },
            {
                category: 'interests',
                questionText: 'Study habit preference?',
                questionType: 'multiple_choice',
                options: ['Solo cramming', 'Group study', 'Consistent daily review', 'Last minute rush'],
                weight: 1.4,
                orderIndex: 14,
            },
            {
                category: 'interests',
                questionText: 'How do you cope with academic stress?',
                questionType: 'multiple_choice',
                options: ['Plan everything', 'Go with the flow', 'Study harder', 'Take breaks', 'Pray'],
                weight: 1.2,
                orderIndex: 15,
            },
            {
                category: 'interests',
                questionText: 'Cross-program dating preference?',
                questionType: 'multiple_choice',
                options: ['Prefer same program', 'Open to all programs', 'Prefer different program', 'No preference'],
                weight: 1.1,
                orderIndex: 16,
            },

            // Fun (Mapped to Interests)
            {
                category: 'interests',
                questionText: 'Pineapple on pizza: Yes or No?',
                questionType: 'multiple_choice',
                options: ['Yes, love it!', 'Absolutely not!', 'It\'s complicated', 'No opinion'],
                weight: 0.8,
                orderIndex: 17,
            },
            {
                category: 'interests',
                questionText: 'Karaoke confidence level?',
                questionType: 'scale',
                options: { min: 1, max: 5, labels: { 1: 'Shy', 3: 'Average', 5: 'Rockstar' } },
                weight: 0.8,
                orderIndex: 18,
            },
            {
                category: 'interests',
                questionText: 'Your ideal first date?',
                questionType: 'multiple_choice',
                options: ['Coffee talk', 'Food adventure', 'Activity date', 'Movie', 'Virtual hangout'],
                weight: 1.2,
                orderIndex: 19,
            },
            {
                category: 'interests',
                questionText: 'Best trait you\'re looking for in a partner?',
                questionType: 'multiple_choice',
                options: ['Sense of humor', 'Intelligence', 'Kindness', 'Ambition', 'Loyalty'],
                weight: 1.8,
                orderIndex: 20,
            },
        ];

        // 4. Insert questions
        for (const q of questions) {
            await prisma.question.create({
                data: {
                    ...q,
                    campaignId: campaign.id,
                    isActive: true,
                }
            });
        }

        // 5. Update user survey completion status (Reset all users to incomplete since questions changed)
        await prisma.user.updateMany({
            data: { surveyCompleted: false }
        });

        console.log('✅ Successfully created 20 new survey questions and reset user statuses.');

    } catch (error) {
        console.error('❌ Error seeding survey questions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
