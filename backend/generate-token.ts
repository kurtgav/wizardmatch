
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || 'c25111a9-1cf9-473e-a769-5d5a6ddf8038';

async function main() {
    const email = 'kurtgavin.design@gmail.com';
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('Creating admin user...');
        user = await prisma.user.create({
            data: {
                email,
                firstName: 'Kurt',
                lastName: 'Gavin',
                username: 'AdminKurt',
                isActive: true,
                surveyCompleted: true
            }
        });
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email }, // Correct key is userId
        secret,
        { expiresIn: '1d' }
    );

    console.log('TOKEN:', token);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
