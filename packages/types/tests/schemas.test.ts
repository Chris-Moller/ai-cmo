import { describe, expect, it } from "vitest";
import {
  UserSchema,
  CreateUserSchema,
  ProjectSchema,
  CreateProjectSchema,
  CompanyProfileSchema,
  CreateCompanyProfileSchema,
  NarrativeModelSchema,
  CreateNarrativeModelSchema,
  CompetitorProfileSchema,
  CreateCompetitorProfileSchema,
  OpportunitySchema,
  CreateOpportunitySchema,
  AssetSchema,
  CreateAssetSchema,
  CampaignSchema,
  CreateCampaignSchema,
  AgentRunSchema,
  CreateAgentRunSchema,
  DailyDigestSchema,
  CreateDailyDigestSchema,
} from "../src/index";

const TEST_UUID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_UUID_2 = "660e8400-e29b-41d4-a716-446655440000";
const TEST_DATE = new Date("2026-01-15T10:00:00Z");

describe("UserSchema", () => {
  const validUser = {
    id: TEST_UUID,
    email: "alice@example.com",
    name: "Alice Smith",
    role: "admin" as const,
    createdAt: TEST_DATE,
    updatedAt: TEST_DATE,
  };

  it("accepts a valid user", () => {
    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("rejects a user with invalid email", () => {
    const result = UserSchema.safeParse({ ...validUser, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a user with invalid role", () => {
    const result = UserSchema.safeParse({ ...validUser, role: "superadmin" });
    expect(result.success).toBe(false);
  });

  it("rejects a user with empty name", () => {
    const result = UserSchema.safeParse({ ...validUser, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a user with missing id", () => {
    const { id, ...noId } = validUser;
    const result = UserSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });

  it("coerces string dates", () => {
    const result = UserSchema.safeParse({
      ...validUser,
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-15T10:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.createdAt).toBeInstanceOf(Date);
    }
  });
});

describe("CreateUserSchema", () => {
  it("accepts a valid create user payload", () => {
    const result = CreateUserSchema.safeParse({
      email: "bob@example.com",
      name: "Bob Jones",
      role: "member",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a payload with missing email", () => {
    const result = CreateUserSchema.safeParse({
      name: "Bob Jones",
      role: "member",
    });
    expect(result.success).toBe(false);
  });
});

describe("ProjectSchema", () => {
  const validProject = {
    id: TEST_UUID,
    name: "My Project",
    description: "A test project",
    userId: TEST_UUID,
    companyProfileId: null,
    status: "active" as const,
    createdAt: TEST_DATE,
    updatedAt: TEST_DATE,
  };

  it("accepts a valid project", () => {
    const result = ProjectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("accepts a project with a company profile id", () => {
    const result = ProjectSchema.safeParse({
      ...validProject,
      companyProfileId: TEST_UUID_2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a project with invalid status", () => {
    const result = ProjectSchema.safeParse({ ...validProject, status: "deleted" });
    expect(result.success).toBe(false);
  });

  it("rejects a project with empty name", () => {
    const result = ProjectSchema.safeParse({ ...validProject, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a project with invalid userId", () => {
    const result = ProjectSchema.safeParse({ ...validProject, userId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("CreateProjectSchema", () => {
  it("accepts a valid create project payload", () => {
    const result = CreateProjectSchema.safeParse({
      name: "New Project",
      description: "Description",
      userId: TEST_UUID,
      companyProfileId: null,
      status: "active",
    });
    expect(result.success).toBe(true);
  });
});

describe("CompanyProfileSchema", () => {
  const validProfile = {
    id: TEST_UUID,
    projectId: TEST_UUID,
    name: "Acme Corp",
    description: "Enterprise solutions",
    industry: "Technology",
    website: "https://acme.example.com",
    positioning: "Market leader in widgets",
  };

  it("accepts a valid company profile", () => {
    const result = CompanyProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("rejects a profile with invalid website", () => {
    const result = CompanyProfileSchema.safeParse({ ...validProfile, website: "not-a-url" });
    expect(result.success).toBe(false);
  });
});

describe("NarrativeModelSchema", () => {
  const validNarrative = {
    id: TEST_UUID,
    projectId: TEST_UUID,
    coreNarrative: "We help businesses grow",
    keyThemes: ["innovation", "growth"],
    voiceAttributes: ["professional", "friendly"],
  };

  it("accepts a valid narrative model", () => {
    const result = NarrativeModelSchema.safeParse(validNarrative);
    expect(result.success).toBe(true);
  });

  it("rejects a narrative with non-array keyThemes", () => {
    const result = NarrativeModelSchema.safeParse({ ...validNarrative, keyThemes: "innovation" });
    expect(result.success).toBe(false);
  });
});

describe("CompetitorProfileSchema", () => {
  const validCompetitor = {
    id: TEST_UUID,
    projectId: TEST_UUID,
    name: "Rival Inc",
    website: "https://rival.example.com",
    description: "Main competitor",
    strengths: ["brand recognition", "large team"],
    weaknesses: ["slow iteration", "high prices"],
  };

  it("accepts a valid competitor profile", () => {
    const result = CompetitorProfileSchema.safeParse(validCompetitor);
    expect(result.success).toBe(true);
  });

  it("rejects a competitor with invalid website", () => {
    const result = CompetitorProfileSchema.safeParse({ ...validCompetitor, website: "bad" });
    expect(result.success).toBe(false);
  });
});

describe("OpportunitySchema", () => {
  const validOpportunity = {
    id: TEST_UUID,
    projectId: TEST_UUID,
    agentId: "search-mog",
    type: "seo" as const,
    title: "Improve SEO ranking",
    description: "Target keyword cluster around AI automation",
    priority: "high" as const,
    status: "new" as const,
    metadata: { keywords: ["ai", "automation"], volume: 12000 },
    createdAt: TEST_DATE,
  };

  it("accepts a valid opportunity", () => {
    const result = OpportunitySchema.safeParse(validOpportunity);
    expect(result.success).toBe(true);
  });

  it("rejects an opportunity with invalid type", () => {
    const result = OpportunitySchema.safeParse({ ...validOpportunity, type: "unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects an opportunity with invalid priority", () => {
    const result = OpportunitySchema.safeParse({ ...validOpportunity, priority: "urgent" });
    expect(result.success).toBe(false);
  });

  it("rejects an opportunity with invalid status", () => {
    const result = OpportunitySchema.safeParse({ ...validOpportunity, status: "deleted" });
    expect(result.success).toBe(false);
  });

  it("rejects an opportunity with empty title", () => {
    const result = OpportunitySchema.safeParse({ ...validOpportunity, title: "" });
    expect(result.success).toBe(false);
  });

  it("accepts empty metadata", () => {
    const result = OpportunitySchema.safeParse({ ...validOpportunity, metadata: {} });
    expect(result.success).toBe(true);
  });
});

describe("CreateOpportunitySchema", () => {
  it("accepts a valid create opportunity payload", () => {
    const result = CreateOpportunitySchema.safeParse({
      projectId: TEST_UUID,
      agentId: "search-mog",
      type: "content",
      title: "New blog post idea",
      description: "Write about emerging trends",
      priority: "medium",
      status: "new",
      metadata: {},
    });
    expect(result.success).toBe(true);
  });
});

describe("AssetSchema", () => {
  const validAsset = {
    id: TEST_UUID,
    opportunityId: TEST_UUID,
    type: "article" as const,
    content: "Article body text here",
    status: "draft" as const,
    createdAt: TEST_DATE,
  };

  it("accepts a valid asset", () => {
    const result = AssetSchema.safeParse(validAsset);
    expect(result.success).toBe(true);
  });

  it("rejects an asset with invalid type", () => {
    const result = AssetSchema.safeParse({ ...validAsset, type: "video" });
    expect(result.success).toBe(false);
  });
});

describe("CampaignSchema", () => {
  const validCampaign = {
    id: TEST_UUID,
    projectId: TEST_UUID,
    name: "Q1 Content Push",
    description: "Campaign for Q1 content",
    status: "draft" as const,
    opportunityIds: [TEST_UUID, TEST_UUID_2],
    createdAt: TEST_DATE,
  };

  it("accepts a valid campaign", () => {
    const result = CampaignSchema.safeParse(validCampaign);
    expect(result.success).toBe(true);
  });

  it("rejects a campaign with non-uuid opportunity ids", () => {
    const result = CampaignSchema.safeParse({
      ...validCampaign,
      opportunityIds: ["not-a-uuid"],
    });
    expect(result.success).toBe(false);
  });
});

describe("AgentRunSchema", () => {
  const validAgentRun = {
    id: TEST_UUID,
    projectId: TEST_UUID,
    agentName: "search-mog",
    status: "completed" as const,
    startedAt: TEST_DATE,
    completedAt: new Date("2026-01-15T10:05:00Z"),
    result: { trends: ["ai", "automation"] },
    error: null,
  };

  it("accepts a valid agent run", () => {
    const result = AgentRunSchema.safeParse(validAgentRun);
    expect(result.success).toBe(true);
  });

  it("accepts an agent run with null completedAt and result", () => {
    const result = AgentRunSchema.safeParse({
      ...validAgentRun,
      status: "pending",
      completedAt: null,
      result: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an agent run with invalid status", () => {
    const result = AgentRunSchema.safeParse({ ...validAgentRun, status: "cancelled" });
    expect(result.success).toBe(false);
  });
});

describe("DailyDigestSchema", () => {
  const validDigest = {
    id: TEST_UUID,
    projectId: TEST_UUID,
    date: TEST_DATE,
    summary: "Today we found 3 new opportunities",
    highlights: ["SEO ranking improved", "New competitor detected"],
    agentRunIds: [TEST_UUID, TEST_UUID_2],
  };

  it("accepts a valid daily digest", () => {
    const result = DailyDigestSchema.safeParse(validDigest);
    expect(result.success).toBe(true);
  });

  it("rejects a digest with non-uuid agentRunIds", () => {
    const result = DailyDigestSchema.safeParse({
      ...validDigest,
      agentRunIds: ["not-a-uuid"],
    });
    expect(result.success).toBe(false);
  });
});
