
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        // Try to count users to see if the table exists
        const userCount = await prisma.user.count();
        console.log(`Successfully connected! User count: ${userCount}`);

        // Also try to query generic table info if possible, but the above is sufficient proof
        console.log('The "User" table exists and is accessible.');
    } catch (error) {
        console.error('Error connecting or querying database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
