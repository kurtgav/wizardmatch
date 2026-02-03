
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database state...');

    try {
        // Check active campaign
        const campaign = await prisma.campaign.findFirst({
            where: { isActive: true }
        });
        console.log('Active Campaign:', campaign);

        if (!campaign) {
            console.log('Creating default campaign...');
            const newCampaign = await prisma.campaign.create({
                data: {
                    name: "Valentine's Match 2026",
                    isActive: true,
                    surveyOpenDate: new Date('2026-02-01T00:00:00Z'),
                    surveyCloseDate: new Date('2026-02-10T23:59:59Z'),
                    profileUpdateStartDate: new Date('2026-02-11T00:00:00Z'),
                    profileUpdateEndDate: new Date('2026-02-13T23:59:59Z'),
                    resultsReleaseDate: new Date('2026-02-14T00:00:00Z'),
                    algorithmVersion: '1.0.0',
                    config: {}
                }
            });
            console.log('Created Campaign:', newCampaign);
        } else {
            // Ensure dates are valid for testing
            // We want survey to be OPEN right now (Feb 3)
            const now = new Date();
            if (campaign.surveyOpenDate > now || campaign.surveyCloseDate < now) {
                console.log('Updating campaign dates to be currently active...');
                await prisma.campaign.update({
                    where: { id: campaign.id },
                    data: {
                        surveyOpenDate: new Date('2026-02-01T00:00:00Z'),
                        surveyCloseDate: new Date('2026-02-10T23:59:59Z'),
                    }
                });
                console.log('Campaign updated.');
            }
        }

        // Check admin setting
        const releaseDate = await prisma.adminSetting.findUnique({
            where: { settingKey: 'matchReleaseDate' }
        });
        console.log('Match Release Date Setting:', releaseDate);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
