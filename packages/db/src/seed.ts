import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './schema/users.js';
import { projects } from './schema/projects.js';
import { companyProfiles } from './schema/company-profiles.js';
import { competitorProfiles } from './schema/competitor-profiles.js';
import { opportunities } from './schema/opportunities.js';
import { agentRuns } from './schema/agent-runs.js';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log('Seeding database...');

  // Create demo user
  const [user] = await db
    .insert(users)
    .values({
      email: 'demo@chiefmog.dev',
      name: 'Demo User',
      role: 'admin',
    })
    .returning();

  console.log('Created user:', user.id);

  // Create demo project
  const [project] = await db
    .insert(projects)
    .values({
      name: 'Acme Corp Intelligence',
      description: 'Competitive intelligence project for Acme Corp',
      userId: user.id,
      status: 'active',
    })
    .returning();

  console.log('Created project:', project.id);

  // Create company profile
  const [companyProfile] = await db
    .insert(companyProfiles)
    .values({
      projectId: project.id,
      name: 'Acme Corp',
      description: 'Leading provider of innovative solutions',
      industry: 'Technology',
      website: 'https://acme.example.com',
      positioning: 'Enterprise-grade solutions for modern businesses',
    })
    .returning();

  console.log('Created company profile:', companyProfile.id);

  // Create competitor profiles
  const competitorData = [
    {
      projectId: project.id,
      name: 'Rival Inc',
      website: 'https://rival.example.com',
      description: 'Direct competitor in the enterprise space',
      strengths: ['Strong brand recognition', 'Large sales team'],
      weaknesses: ['Slow product iteration', 'Legacy tech stack'],
    },
    {
      projectId: project.id,
      name: 'Disruptor Labs',
      website: 'https://disruptor.example.com',
      description: 'Emerging startup with innovative approach',
      strengths: ['Modern technology', 'Aggressive pricing'],
      weaknesses: ['Limited market presence', 'Small support team'],
    },
  ];

  const insertedCompetitors = await db
    .insert(competitorProfiles)
    .values(competitorData)
    .returning();

  console.log('Created competitors:', insertedCompetitors.length);

  // Create opportunities
  const opportunityData = [
    {
      projectId: project.id,
      agentId: 'search-mog',
      type: 'search' as const,
      title: 'Rising search trend: "enterprise AI solutions"',
      description:
        'Search volume for "enterprise AI solutions" has increased 45% in the past month. Consider creating targeted content.',
      confidence: 0.82,
      status: 'new' as const,
    },
    {
      projectId: project.id,
      agentId: 'competitor-intel',
      type: 'competitive' as const,
      title: 'Rival Inc pricing page updated',
      description:
        'Rival Inc has updated their pricing page, removing the free tier. This creates an opportunity to capture price-sensitive customers.',
      confidence: 0.91,
      status: 'new' as const,
    },
  ];

  const insertedOpportunities = await db
    .insert(opportunities)
    .values(opportunityData)
    .returning();

  console.log('Created opportunities:', insertedOpportunities.length);

  // Create an agent run
  const [agentRun] = await db
    .insert(agentRuns)
    .values({
      projectId: project.id,
      agentId: 'search-mog',
      status: 'completed',
      startedAt: new Date(Date.now() - 60000),
      completedAt: new Date(),
      result: { dataPoints: 150, insights: 3, opportunities: 1 },
    })
    .returning();

  console.log('Created agent run:', agentRun.id);

  console.log('Seeding complete!');
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
