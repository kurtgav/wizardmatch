import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing database schema manually...');
    try {
        // Fix Users table
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS seeking_gender TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_preference TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP(3);`);
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_handle TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_profile TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'Matches Only';`);

        // Make student_id optional? Schema says optional String? @unique. 
        // If it's not optional in DB, we should relax it or ensure we provide it.
        // In auth.controller, we provide it.

        console.log('Successfully added columns to users table.');
    } catch (e) {
        console.error('Error fixing DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
