import { prisma } from '../config/db.config';
import { logger } from '../utils/logger';
import { crushService } from './crush.service';

interface MatchScore {
  score: number;
  breakdown: {
    demographics: number;
    personality: number;
    values: number;
    lifestyle: number;
    interests: number;
  };
  isMutualCrush: boolean;
  hasCrush: boolean;
}

// Updated weight constants (from master workflow)
const WEIGHTS = {
  DEMOGRAPHICS: 0.10,
  PERSONALITY: 0.30,
  VALUES: 0.25,
  LIFESTYLE: 0.20,
  INTERESTS: 0.15,
};

// Scoring methods
const ScoringMethods = {
  // Gaussian similarity for questions where closeness matters
  gaussianSimilarity(val1: number, val2: number, tolerance: number = 1.5): number {
    const diff = Math.abs(val1 - val2);
    return Math.exp(-(diff * diff) / (2 * tolerance * tolerance));
  },

  // Jaccard similarity for interests/hobbies
  jaccardSimilarity(set1: string[], set2: string[]): number {
    if (!set1 || !set2 || set1.length === 0 || set2.length === 0) {
      return 0;
    }
    const intersection = set1.filter(x => set2.includes(x));
    const union = [...new Set([...set1, ...set2])];
    return intersection.length / union.length;
  },

  // Inverse distance for lifestyle questions
  inverseDistance(val1: number, val2: number, max: number = 10): number {
    if (val1 === null || val2 === null) return 0.5;
    return 1 - Math.abs(val1 - val2) / max;
  },

  // Exact match for multiple choice
  exactMatch(val1: string, val2: string): number {
    return val1 === val2 ? 1 : 0;
  },
};

export const matchingService = {
  /**
   * Generate all matches for a campaign
   */
  async generateAllMatches(campaignId: string): Promise<{ matchesCreated: number; totalUsers: number }> {
    logger.info(`Starting match generation for campaign ${campaignId}...`);

    // Get all users who have completed the survey for this campaign
    const users = await prisma.user.findMany({
      where: {
        surveyCompleted: true,
        isActive: true,
        surveyResponses: {
          some: { campaignId },
        },
      },
      include: {
        surveyResponses: {
          where: { campaignId },
          include: { question: true },
        },
      },
    });

    logger.info(`Found ${users.length} users with completed surveys for campaign ${campaignId}`);

    let matchesCreated = 0;

    // Clear existing matches for this campaign
    await prisma.match.deleteMany({
      where: { campaignId },
    });
    logger.info('Cleared existing matches for campaign');

    // Separate users into preference pools based on seeking_gender
    const pools = this.separateByPreferencePools(users);

    // Generate matches within each pool
    for (const pool of pools) {
      logger.info(`Processing pool with ${pool.length} users`);

      // Calculate compatibility scores for all pairs
      const scoredPairs: Array<{
        user1: any;
        user2: any;
        score: MatchScore;
      }> = [];

      for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
          const user1 = pool[i];
          const user2 = pool[j];

          const score = await this.calculateCompatibility(user1, user2, campaignId);
          scoredPairs.push({ user1, user2, score });
        }
      }

      // Sort pairs by score
      scoredPairs.sort((a, b) => b.score.score - a.score.score);

      // Generate matches using greedy approach (simplified Hungarian)
      const userMatchCount = new Map<string, number>();
      const maxMatchesPerUser = 7;

      for (const pair of scoredPairs) {
        if (matchesCreated >= 10000) break; // Safety limit

        const user1Count = userMatchCount.get(pair.user1.id) || 0;
        const user2Count = userMatchCount.get(pair.user2.id) || 0;

        // Check if both users need more matches
        if (user1Count < maxMatchesPerUser && user2Count < maxMatchesPerUser) {
          // Skip if score is too low (unless it's a mutual crush)
          if (pair.score.score < 50 && !pair.score.isMutualCrush) {
            continue;
          }

          try {
            const match = await prisma.match.create({
              data: {
                campaignId,
                user1Id: pair.user1.id,
                user2Id: pair.user2.id,
                compatibilityScore: pair.score.score,
                matchTier: this.getMatchTier(pair.score.score),
                sharedInterests: pair.score.breakdown,
                rankForUser1: user1Count + 1,
                rankForUser2: user2Count + 1,
                isMutualCrush: pair.score.isMutualCrush,
              },
            });

            matchesCreated++;
            userMatchCount.set(pair.user1.id, user1Count + 1);
            userMatchCount.set(pair.user2.id, user2Count + 1);

            logger.info(`Created match: ${pair.user1.firstName} <-> ${pair.user2.firstName} (${pair.score.score.toFixed(1)}%)`);
          } catch (error) {
            // Duplicate match - skip
            continue;
          }
        }
      }
    }

    // Update campaign stats
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        totalParticipants: users.length,
        totalMatchesGenerated: matchesCreated,
      },
    });

    logger.info(`Match generation complete. Created ${matchesCreated} matches from ${users.length} users`);

    return { matchesCreated, totalUsers: users.length };
  },

  /**
   * Separate users into preference pools based on gender preferences
   */
  separateByPreferencePools(users: any[]): any[][] {
    const pools: Map<string, any[]> = new Map();

    for (const user of users) {
      const seekingGender = user.seekingGender || 'any';

      // For simplicity, create pools based on combinations
      // In production, this would be more sophisticated
      let poolKey = 'any';
      if (seekingGender !== 'any') {
        poolKey = `${user.gender}_${seekingGender}`;
      }

      if (!pools.has(poolKey)) {
        pools.set(poolKey, []);
      }
      pools.get(poolKey)!.push(user);
    }

    return Array.from(pools.values());
  },

  /**
   * Check if two users meet each other's basic criteria
   */
  meetsPreferences(user1: any, user2: any): boolean {
    // Check gender preferences
    if (user1.seekingGender && user1.seekingGender !== 'any') {
      const preferences = user1.seekingGender.toLowerCase().split(',').map((s: string) => s.trim());
      const user2Gender = user2.gender?.toLowerCase();

      if (!user2Gender || !preferences.includes(user2Gender)) {
        return false;
      }
    }

    if (user2.seekingGender && user2.seekingGender !== 'any') {
      const preferences = user2.seekingGender.toLowerCase().split(',').map((s: string) => s.trim());
      const user1Gender = user1.gender?.toLowerCase();

      if (!user1Gender || !preferences.includes(user1Gender)) {
        return false;
      }
    }

    return true;
  },

  /**
   * Calculate compatibility between two users
   */
  async calculateCompatibility(user1: any, user2: any, campaignId: string): Promise<MatchScore> {
    // Check basic preferences first
    if (!this.meetsPreferences(user1, user2)) {
      return {
        score: 0,
        breakdown: {
          demographics: 0,
          personality: 0,
          values: 0,
          lifestyle: 0,
          interests: 0,
        },
        isMutualCrush: false,
        hasCrush: false,
      };
    }

    // Group responses by category
    const responses1 = this.groupResponsesByCategory(user1.surveyResponses);
    const responses2 = this.groupResponsesByCategory(user2.surveyResponses);

    // Calculate category scores
    const demographics = this.calculateCategoryScore(
      responses1.demographics || [],
      responses2.demographics || [],
      'demographics'
    );
    const personality = this.calculateCategoryScore(
      responses1.personality || [],
      responses2.personality || [],
      'personality'
    );
    const values = this.calculateCategoryScore(
      responses1.values || [],
      responses2.values || [],
      'values'
    );
    const lifestyle = this.calculateCategoryScore(
      responses1.lifestyle || [],
      responses2.lifestyle || [],
      'lifestyle'
    );
    const interests = this.calculateCategoryScore(
      responses1.interests || [],
      responses2.interests || [],
      'interests'
    );

    // Calculate weighted total
    let score =
      demographics * WEIGHTS.DEMOGRAPHICS +
      personality * WEIGHTS.PERSONALITY +
      values * WEIGHTS.VALUES +
      lifestyle * WEIGHTS.LIFESTYLE +
      interests * WEIGHTS.INTERESTS;

    // Apply crush bonuses
    const crushBonus = await crushService.getCrushBonus(user1.id, user2.id, campaignId);
    let isMutualCrush = false;
    let hasCrush = false;

    if (crushBonus > 1) {
      score = score * crushBonus;
      isMutualCrush = crushBonus >= 1.20;
      hasCrush = true;
    }

    // Apply small bonuses for demographic similarities
    if (user1.program && user1.program === user2.program) {
      score += 2;
    }
    if (user1.yearLevel && user2.yearLevel && Math.abs(user1.yearLevel - user2.yearLevel) <= 1) {
      score += 1;
    }

    const finalScore = Math.min(100, score);

    return {
      score: Math.round(finalScore * 100) / 100,
      breakdown: {
        demographics: Math.round(demographics),
        personality: Math.round(personality),
        values: Math.round(values),
        lifestyle: Math.round(lifestyle),
        interests: Math.round(interests),
      },
      isMutualCrush,
      hasCrush,
    };
  },

  /**
   * Group survey responses by question category
   */
  groupResponsesByCategory(responses: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    for (const response of responses) {
      const category = response.question.category.toLowerCase();

      // Map categories to our standard categories
      const standardCategory = this.mapToStandardCategory(category);

      if (!grouped[standardCategory]) {
        grouped[standardCategory] = [];
      }
      grouped[standardCategory].push(response);
    }

    return grouped;
  },

  /**
   * Map question categories to standard categories
   */
  mapToStandardCategory(category: string): string {
    const mapping: Record<string, string> = {
      'demographics': 'demographics',
      'core_values': 'values',
      'lifestyle': 'lifestyle',
      'personality': 'personality',
      'fun': 'interests',
      'academic': 'interests',
      'interests': 'interests',
      'values': 'values',
    };

    return mapping[category] || category;
  },

  /**
   * Calculate score for a category
   */
  calculateCategoryScore(responses1: any[], responses2: any[], category: string): number {
    if (responses1.length === 0 || responses2.length === 0) {
      return 50; // Neutral score if no data
    }

    let totalSimilarity = 0;
    let weightSum = 0;

    // Match responses by question ID
    for (const r1 of responses1) {
      const r2 = responses2.find(r => r.questionId === r1.questionId);
      if (!r2) continue;

      const questionWeight = Number(r1.question.weight) || 1;
      const similarity = this.calculateSimilarity(r1, r2, category);

      totalSimilarity += similarity * questionWeight;
      weightSum += questionWeight;
    }

    return weightSum > 0 ? (totalSimilarity / weightSum) * 100 : 50;
  },

  /**
   * Calculate similarity between two responses
   */
  calculateSimilarity(r1: any, r2: any, category: string): number {
    const answerType = r1.answerType;

    if (answerType === 'scale' || answerType === 'ranking') {
      if (r1.answerValue === null || r2.answerValue === null) return 0.5;

      // Use gaussian similarity for personality and values
      if (category === 'personality' || category === 'values') {
        return ScoringMethods.gaussianSimilarity(r1.answerValue, r2.answerValue, 1.5);
      }

      // Use inverse distance for lifestyle
      return ScoringMethods.inverseDistance(r1.answerValue, r2.answerValue, 10);
    }

    if (answerType === 'multiple_choice') {
      return ScoringMethods.exactMatch(r1.answerText || '', r2.answerText || '');
    }

    // Default: moderate similarity
    return 0.5;
  },

  /**
   * Get match tier based on score
   */
  getMatchTier(score: number): string {
    if (score >= 95) return 'perfect';
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'great';
    if (score >= 65) return 'good';
    return 'fair';
  },
};
