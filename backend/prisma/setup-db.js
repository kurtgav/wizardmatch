const { PrismaClient } = require('@prisma/client');

// Disable prepared statements for Supabase pooler
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?pgbouncer=true',
    },
  },
});

const tables = [
  {
    name: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        student_id TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        program TEXT NOT NULL,
        year_level INTEGER NOT NULL,
        gender TEXT,
        date_of_birth TIMESTAMP,
        profile_photo_url TEXT,
        bio TEXT,
        instagram_handle TEXT,
        facebook_profile TEXT,
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        survey_completed BOOLEAN DEFAULT false
      );
    `,
  },
  {
    name: 'questions',
    sql: `
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        options JSONB,
        weight DECIMAL(3,2) DEFAULT 1.00,
        is_active BOOLEAN DEFAULT true,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: 'survey_responses',
    sql: `
      CREATE TABLE IF NOT EXISTS survey_responses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        answer_text TEXT,
        answer_value INTEGER,
        answer_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, question_id)
      );
    `,
  },
  {
    name: 'matches',
    sql: `
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        compatibility_score DECIMAL(5,2) NOT NULL,
        match_tier TEXT,
        shared_interests JSONB,
        is_revealed BOOLEAN DEFAULT false,
        is_mutual_interest BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        revealed_at TIMESTAMP,
        UNIQUE(user1_id, user2_id)
      );
    `,
  },
  {
    name: 'interactions',
    sql: `
      CREATE TABLE IF NOT EXISTS interactions (
        id TEXT PRIMARY KEY,
        match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        interaction_type TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: 'admin_settings',
    sql: `
      CREATE TABLE IF NOT EXISTS admin_settings (
        id TEXT PRIMARY KEY,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT REFERENCES users(id)
      );
    `,
  },
  {
    name: 'testimonials',
    sql: `
      CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        heading TEXT NOT NULL,
        content TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];

async function setupDatabase() {
  console.log('🔧 Setting up database schema...');

  for (const table of tables) {
    // Create new connection for each query
    const client = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    try {
      await client.$executeRawUnsafe(table.sql);
      console.log(`✅ Created ${table.name} table`);
    } catch (error) {
      // Ignore error if table already exists
      if (error.code === 'P2010' || error.message?.includes('already exists')) {
        console.log(`⚠️  ${table.name} table already exists, skipping...`);
      } else {
        console.error(`❌ Error creating ${table.name} table:`, error.message);
      }
    } finally {
      await client.$disconnect();
    }
  }

  console.log('🎉 Database schema setup complete!');
}

setupDatabase()
  .then(() => {
    console.log('✅ Setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
