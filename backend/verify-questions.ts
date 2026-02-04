import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuestions() {
    try {
        const campaign = await prisma.campaign.findFirst({
            where: { isActive: true },
        });

        if (!campaign) {
            console.log('❌ No active campaign found.');
            return;
        }

        const questionCount = await prisma.question.count({
            where: {
                campaignId: campaign.id,
                isActive: true
            }
        });

        console.log(`✅ Active Campaign: ${campaign.name}`);
        console.log(`📊 Total Active Questions: ${questionCount}`);

        if (questionCount === 20) {
            console.log('✅ Perfect! You have exactly 20 questions.');
        } else {
            console.log(`⚠️ Warning: Expected 20 questions, but found ${questionCount}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkQuestions();
