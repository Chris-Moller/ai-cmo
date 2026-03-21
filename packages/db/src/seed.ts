import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
	agentRuns,
	companyProfiles,
	competitorProfiles,
	dailyDigests,
	narrativeModels,
	opportunities,
	projects,
	users,
} from "./schema/index.js";

async function seed() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		console.error("DATABASE_URL is required");
		process.exit(1);
	}

	const db = drizzle(connectionString);

	// Check if seed data already exists
	const existingUsers = await db.select().from(users).where(eq(users.email, "sarah@mogcorp.io"));
	if (existingUsers.length > 0) {
		console.log("Seed data already exists, skipping.");
		process.exit(0);
	}

	// 1. Create user
	const [user] = await db
		.insert(users)
		.values({
			email: "sarah@mogcorp.io",
			name: "Sarah Chen",
			role: "admin",
		})
		.returning();
	console.log("Created user:", user.name);

	// 2. Create project
	const [project] = await db
		.insert(projects)
		.values({
			name: "Acme DevTools Launch",
			description: "Competitive intelligence for Acme developer tools platform launch in Q2 2026",
			userId: user.id,
			status: "active",
		})
		.returning();
	console.log("Created project:", project.name);

	// 3. Create company profile
	const [companyProfile] = await db
		.insert(companyProfiles)
		.values({
			projectId: project.id,
			name: "Acme Corp",
			description: "Enterprise developer tools and cloud infrastructure platform",
			industry: "Developer Tools / SaaS",
			website: "https://acme.dev",
			positioning: "The all-in-one platform for modern development teams shipping faster with AI-powered workflows",
		})
		.returning();
	console.log("Created company profile:", companyProfile.name);

	// 4. Create narrative model
	const [narrative] = await db
		.insert(narrativeModels)
		.values({
			projectId: project.id,
			coreNarrative: "Acme empowers development teams to ship 10x faster by combining AI-assisted coding, automated testing, and seamless deployment into a single platform.",
			keyThemes: ["developer productivity", "AI-assisted development", "platform consolidation", "shipping velocity"],
			voiceAttributes: ["technical", "confident", "data-driven", "forward-looking"],
		})
		.returning();
	console.log("Created narrative model for project:", project.name);

	// 5. Create competitor profiles
	const [comp1] = await db
		.insert(competitorProfiles)
		.values({
			projectId: project.id,
			name: "Vercel",
			website: "https://vercel.com",
			description: "Frontend cloud platform with deployment, serverless, and edge infrastructure",
			strengths: ["Strong developer community", "Excellent DX", "Next.js ecosystem lock-in", "Edge network"],
			weaknesses: ["Frontend-focused only", "Expensive at scale", "Vendor lock-in concerns"],
		})
		.returning();
	console.log("Created competitor:", comp1.name);

	const [comp2] = await db
		.insert(competitorProfiles)
		.values({
			projectId: project.id,
			name: "Railway",
			website: "https://railway.app",
			description: "Modern PaaS for full-stack application deployment and infrastructure",
			strengths: ["Simple UX", "Full-stack support", "Transparent pricing", "Fast onboarding"],
			weaknesses: ["Smaller scale", "Limited enterprise features", "Newer in market"],
		})
		.returning();
	console.log("Created competitor:", comp2.name);

	// 6. Create opportunities
	const opps = await db
		.insert(opportunities)
		.values([
			{
				projectId: project.id,
				agentId: "search-mog",
				type: "seo" as const,
				title: "Rising search interest in 'AI code review tools'",
				description: "Search volume for 'AI code review' increased 340% in the last 90 days. Acme's code review feature is well-positioned but has no dedicated landing page or content.",
				priority: "high" as const,
				status: "new" as const,
				metadata: { searchVolume: 18500, trend: "rising", competition: "medium" },
			},
			{
				projectId: project.id,
				agentId: "competitor-intel",
				type: "competitive" as const,
				title: "Vercel announced enterprise tier price increase",
				description: "Vercel is increasing enterprise pricing by 25% in Q3. This creates an opportunity to target cost-conscious enterprise teams with migration content and comparison pages.",
				priority: "high" as const,
				status: "reviewed" as const,
				metadata: { source: "vercel-blog", priceIncrease: "25%", effectiveDate: "2026-07-01" },
			},
			{
				projectId: project.id,
				agentId: "content-foundry",
				type: "content" as const,
				title: "Technical blog series: 'Migrating from Heroku to Acme'",
				description: "High-intent keyword opportunity. Create a 5-part migration guide targeting teams still on Heroku looking for modern alternatives.",
				priority: "medium" as const,
				status: "new" as const,
				metadata: { targetKeywords: ["heroku alternative", "heroku migration", "modern PaaS"], estimatedTraffic: 5200 },
			},
		])
		.returning();
	console.log("Created", opps.length, "opportunities");

	// 7. Create agent run
	const [agentRun] = await db
		.insert(agentRuns)
		.values({
			projectId: project.id,
			agentName: "search-mog",
			status: "completed",
			startedAt: new Date("2026-03-20T08:00:00Z"),
			completedAt: new Date("2026-03-20T08:02:30Z"),
			result: { trendsAnalyzed: 150, opportunitiesFound: 3, topKeyword: "AI code review tools" },
		})
		.returning();
	console.log("Created agent run:", agentRun.agentName);

	// 8. Create daily digest
	const [digest] = await db
		.insert(dailyDigests)
		.values({
			projectId: project.id,
			date: new Date("2026-03-20"),
			summary: "3 new opportunities detected. Search trends show rising interest in AI code review tools. Vercel enterprise pricing change creates competitive window.",
			highlights: [
				"Search volume for 'AI code review' up 340%",
				"Vercel enterprise pricing increasing 25% in Q3",
				"Content gap identified for Heroku migration guides",
			],
			agentRunIds: [agentRun.id],
		})
		.returning();
	console.log("Created daily digest for:", digest.date);

	console.log("\nSeed completed successfully!");
	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
