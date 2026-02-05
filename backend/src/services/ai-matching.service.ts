import { prisma } from '../config/db.config';
import { logger } from '../utils/logger';

// AI/LLM Integration for compatibility scoring
// Supports: GLM-4 (ZhipuAI), OpenAI GPT-4, Anthropic Claude
// Priority: GLM_API_KEY > OPENAI_API_KEY > ANTHROPIC_API_KEY

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    program: string | null;
    yearLevel: number | null;
    gender: string | null;
    seekingGender: string | null;
    bio: string | null;
    surveyResponses: Array<{
        question: {
            category: string;
            questionText: string;
        };
        answerText: string | null;
        answerValue: number | null;
    }>;
}

interface CompatibilityResult {
    user1Id: string;
    user2Id: string;
    score: number;
    reasoning: string;
    sharedInterests: string[];
}

// Compatibility prompt template
const COMPATIBILITY_PROMPT = `You are an expert matchmaker analyzing two user profiles for romantic compatibility.

USER A:
- Name: {{user1Name}}
- Program: {{user1Program}}
- Year Level: {{user1Year}}
- Gender: {{user1Gender}}
- Looking for: {{user1Seeking}}
- Bio: {{user1Bio}}
- Survey Answers:
{{user1Answers}}

USER B:
- Name: {{user2Name}}
- Program: {{user2Program}}
- Year Level: {{user2Year}}
- Gender: {{user2Gender}}
- Looking for: {{user2Seeking}}
- Bio: {{user2Bio}}
- Survey Answers:
{{user2Answers}}

Analyze these profiles and rate their romantic compatibility on a scale of 0-100.
Consider:
1. Values alignment (most important)
2. Lifestyle compatibility
3. Communication styles
4. Shared interests
5. Life goals
6. Gender preference matching

Respond in JSON format:
{
  "score": <0-100>,
  "reasoning": "<brief explanation>",
  "sharedInterests": ["<interest1>", "<interest2>"]
}`;

export const aiMatchingService = {
    /**
     * Generate AI-powered matches for a campaign
     */
    async generateAIMatches(campaignId: string): Promise<{
        matchesCreated: number;
        usersProcessed: number;
        averageScore: number;
    }> {
        logger.info(`Starting AI match generation for campaign ${campaignId}...`);

        // Get all users with completed surveys
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
                    include: {
                        question: {
                            select: {
                                category: true,
                                questionText: true,
                            },
                        },
                    },
                },
            },
        });

        logger.info(`Found ${users.length} users for AI matching`);

        if (users.length < 2) {
            return { matchesCreated: 0, usersProcessed: 0, averageScore: 0 };
        }

        let matchesCreated = 0;
        let totalScore = 0;
        const processedPairs = new Set<string>();
        const maxMatchesPerUser = 7;
        const userMatchCount = new Map<string, number>();

        // Process user pairs in batches to avoid rate limits
        const BATCH_SIZE = 10;
        const BATCH_DELAY_MS = 1000;

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const user1 = users[i];
                const user2 = users[j];
                const pairKey = [user1.id, user2.id].sort().join('-');

                if (processedPairs.has(pairKey)) continue;
                processedPairs.add(pairKey);

                // Check match limits
                const user1Count = userMatchCount.get(user1.id) || 0;
                const user2Count = userMatchCount.get(user2.id) || 0;

                if (user1Count >= maxMatchesPerUser && user2Count >= maxMatchesPerUser) {
                    continue;
                }

                // Check gender preferences
                if (!this.meetsGenderPreferences(user1, user2)) {
                    continue;
                }

                try {
                    // Calculate compatibility using AI or fallback
                    const result = await this.calculateAICompatibility(user1, user2);

                    if (result.score >= 75) {
                        // Create match if score is high enough
                        await prisma.match.upsert({
                            where: {
                                user1Id_user2Id: {
                                    user1Id: user1.id,
                                    user2Id: user2.id,
                                },
                            },
                            update: {
                                compatibilityScore: result.score,
                                matchTier: this.getMatchTier(result.score),
                                sharedInterests: result.sharedInterests,
                            },
                            create: {
                                campaignId,
                                user1Id: user1.id,
                                user2Id: user2.id,
                                compatibilityScore: result.score,
                                matchTier: this.getMatchTier(result.score),
                                sharedInterests: result.sharedInterests,
                                isRevealed: false,
                            },
                        });

                        matchesCreated++;
                        totalScore += result.score;
                        userMatchCount.set(user1.id, user1Count + 1);
                        userMatchCount.set(user2.id, user2Count + 1);

                        logger.info(`AI Match: ${user1.firstName} <-> ${user2.firstName} (${result.score}%)`);
                    }

                    // Rate limiting
                    if (matchesCreated % BATCH_SIZE === 0) {
                        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
                    }
                } catch (error) {
                    logger.error(`Failed to process pair ${user1.id}-${user2.id}:`, error);
                }
            }
        }

        // Update campaign stats
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                totalParticipants: users.length,
                totalMatchesGenerated: matchesCreated,
                algorithmVersion: 'ai-v1.0',
            },
        });

        const averageScore = matchesCreated > 0 ? totalScore / matchesCreated : 0;

        logger.info(`AI match generation complete: ${matchesCreated} matches, avg score ${averageScore.toFixed(1)}%`);

        return {
            matchesCreated,
            usersProcessed: users.length,
            averageScore: Math.round(averageScore * 100) / 100,
        };
    },

    /**
     * Calculate AI-powered compatibility score
     * Falls back to algorithmic scoring if AI is unavailable
     */
    async calculateAICompatibility(
        user1: UserProfile,
        user2: UserProfile
    ): Promise<CompatibilityResult> {
        // Try AI-based scoring first if API key is available
        // Priority: GLM > OpenAI > Anthropic
        const hasApiKey = process.env.GLM_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

        if (hasApiKey) {
            try {
                return await this.callLLMAPI(user1, user2);
            } catch (error) {
                logger.warn(`AI API call failed, falling back to algorithmic scoring: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        // Fallback: Algorithmic compatibility scoring
        return this.algorithmicCompatibility(user1, user2);
    },

    /**
     * Call LLM API for compatibility scoring
     * Priority: GLM-4 > OpenAI > Anthropic
     */
    async callLLMAPI(
        user1: UserProfile,
        user2: UserProfile
    ): Promise<CompatibilityResult> {
        const prompt = this.buildPrompt(user1, user2);

        // GLM-4 API call (ZhipuAI) - PRIORITY 1
        if (process.env.GLM_API_KEY) {
            logger.info('Using GLM-4 for compatibility scoring');

            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'glm-4', // or 'glm-4-flash' for faster/cheaper
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert matchmaker. Respond only in valid JSON format.',
                        },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`GLM-4 API error: ${response.status} - ${errorText}`);
                throw new Error(`GLM-4 API error: ${response.status}`);
            }

            const data = await response.json() as { choices: Array<{ message: { content: string } }> };
            const content = data.choices[0].message.content;

            // Parse JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from GLM-4');
            }

            const result = JSON.parse(jsonMatch[0]);
            return {
                user1Id: user1.id,
                user2Id: user2.id,
                score: Math.min(100, Math.max(0, result.score)),
                reasoning: result.reasoning || '',
                sharedInterests: result.sharedInterests || [],
            };
        }

        // OpenAI API call - PRIORITY 2
        if (process.env.OPENAI_API_KEY) {
            logger.info('Using OpenAI for compatibility scoring');

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert matchmaker. Respond only in valid JSON format.',
                        },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json() as { choices: Array<{ message: { content: string } }> };
            const content = data.choices[0].message.content;

            // Parse JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from AI');
            }

            const result = JSON.parse(jsonMatch[0]);
            return {
                user1Id: user1.id,
                user2Id: user2.id,
                score: Math.min(100, Math.max(0, result.score)),
                reasoning: result.reasoning || '',
                sharedInterests: result.sharedInterests || [],
            };
        }

        // Anthropic API call
        if (process.env.ANTHROPIC_API_KEY) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 500,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            if (!response.ok) {
                throw new Error(`Anthropic API error: ${response.status}`);
            }

            const data = await response.json() as { content: Array<{ text: string }> };
            const content = data.content[0].text;

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from AI');
            }

            const result = JSON.parse(jsonMatch[0]);
            return {
                user1Id: user1.id,
                user2Id: user2.id,
                score: Math.min(100, Math.max(0, result.score)),
                reasoning: result.reasoning || '',
                sharedInterests: result.sharedInterests || [],
            };
        }

        throw new Error('No AI API key configured');
    },

    /**
     * Algorithmic compatibility scoring (fallback)
     */
    algorithmicCompatibility(
        user1: UserProfile,
        user2: UserProfile
    ): CompatibilityResult {
        let score = 50; // Base score
        const sharedInterests: string[] = [];

        // Same program bonus
        if (user1.program && user1.program === user2.program) {
            score += 10;
            sharedInterests.push(`Same program: ${user1.program}`);
        }

        // Similar year level bonus
        if (user1.yearLevel && user2.yearLevel) {
            const yearDiff = Math.abs(user1.yearLevel - user2.yearLevel);
            if (yearDiff === 0) score += 5;
            else if (yearDiff === 1) score += 3;
        }

        // Survey answer matching
        const answers1 = new Map(
            user1.surveyResponses.map(r => [r.question.questionText, r.answerText || r.answerValue?.toString()])
        );
        const answers2 = new Map(
            user2.surveyResponses.map(r => [r.question.questionText, r.answerText || r.answerValue?.toString()])
        );

        let matchingAnswers = 0;
        let totalQuestions = 0;

        answers1.forEach((answer1, question) => {
            const answer2 = answers2.get(question);
            if (answer2 !== undefined) {
                totalQuestions++;
                if (answer1 === answer2) {
                    matchingAnswers++;
                    // Add first few shared interests
                    if (sharedInterests.length < 5) {
                        sharedInterests.push(question.substring(0, 50));
                    }
                }
            }
        });

        if (totalQuestions > 0) {
            const matchRate = matchingAnswers / totalQuestions;
            score += Math.round(matchRate * 40); // Up to 40 points for survey matching
        }

        // Cap score at 100
        score = Math.min(100, score);

        return {
            user1Id: user1.id,
            user2Id: user2.id,
            score,
            reasoning: `Algorithmic match based on ${matchingAnswers}/${totalQuestions} matching answers`,
            sharedInterests,
        };
    },

    /**
     * Build prompt for LLM
     */
    buildPrompt(user1: UserProfile, user2: UserProfile): string {
        const formatAnswers = (user: UserProfile): string => {
            return user.surveyResponses
                .map(r => `  - ${r.question.questionText}: ${r.answerText || r.answerValue}`)
                .join('\n');
        };

        return COMPATIBILITY_PROMPT
            .replace('{{user1Name}}', `${user1.firstName} ${user1.lastName}`)
            .replace('{{user1Program}}', user1.program || 'Not specified')
            .replace('{{user1Year}}', user1.yearLevel?.toString() || 'Not specified')
            .replace('{{user1Gender}}', user1.gender || 'Not specified')
            .replace('{{user1Seeking}}', user1.seekingGender || 'Any')
            .replace('{{user1Bio}}', user1.bio || 'No bio provided')
            .replace('{{user1Answers}}', formatAnswers(user1))
            .replace('{{user2Name}}', `${user2.firstName} ${user2.lastName}`)
            .replace('{{user2Program}}', user2.program || 'Not specified')
            .replace('{{user2Year}}', user2.yearLevel?.toString() || 'Not specified')
            .replace('{{user2Gender}}', user2.gender || 'Not specified')
            .replace('{{user2Seeking}}', user2.seekingGender || 'Any')
            .replace('{{user2Bio}}', user2.bio || 'No bio provided')
            .replace('{{user2Answers}}', formatAnswers(user2));
    },

    /**
     * Check if users meet each other's gender preferences
     */
    meetsGenderPreferences(user1: UserProfile, user2: UserProfile): boolean {
        // Check if user1 is seeking user2's gender
        if (user1.seekingGender && user1.seekingGender.toLowerCase() !== 'any') {
            const seeking = user1.seekingGender.toLowerCase().split(',').map(s => s.trim());
            if (!user2.gender || !seeking.includes(user2.gender.toLowerCase())) {
                return false;
            }
        }

        // Check if user2 is seeking user1's gender
        if (user2.seekingGender && user2.seekingGender.toLowerCase() !== 'any') {
            const seeking = user2.seekingGender.toLowerCase().split(',').map(s => s.trim());
            if (!user1.gender || !seeking.includes(user1.gender.toLowerCase())) {
                return false;
            }
        }

        return true;
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
