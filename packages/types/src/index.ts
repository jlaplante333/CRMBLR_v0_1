import { z } from 'zod';

// Base types
export const UuidSchema = z.string().uuid();
export const EmailSchema = z.string().email();
export const TenantIdSchema = z.string().uuid();

// Enums
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum ContactStage {
  IDENTIFIED = 'identified',
  QUALIFIED = 'qualified',
  CULTIVATED = 'cultivated',
  SOLICITED = 'solicited',
  STEWARDED = 'stewarded',
}

export enum OrganizationType {
  FOUNDATION = 'foundation',
  VENUE = 'venue',
  PARTNER = 'partner',
  FUNDER = 'funder',
}

export enum ThankYouStatus {
  NONE = 'none',
  PENDING = 'pending',
  SENT = 'sent',
}

export enum GrantStatus {
  PROSPECT = 'prospect',
  SUBMITTED = 'submitted',
  AWARDED = 'awarded',
  DECLINED = 'declined',
  REPORT_DUE = 'report_due',
}

export enum StaffTeam {
  ADMINISTRATION = 'administration',
  BOARD = 'board',
  DEVELOPMENT = 'development',
  PROGRAMS = 'programs',
}

export enum FileSource {
  UPLOAD = 'upload',
  ETL = 'etl',
}

// Tenant schemas
export const TenantBrandingSchema = z.object({
  palette: z.array(z.string()),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
});

export const TenantSettingsSchema = z.object({
  subdomain: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  features: z.record(z.boolean()).optional(),
});

export const TenantSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  slug: z.string(),
  status: z.enum(['active', 'suspended', 'pending']),
  branding: TenantBrandingSchema,
  settings: TenantSettingsSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// User schemas
export const UserSchema = z.object({
  id: UuidSchema,
  email: EmailSchema,
  name: z.string(),
  cognitoId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserTenantSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  tenantId: UuidSchema,
  role: z.nativeEnum(UserRole),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Contact schemas
export const ContactSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  firstName: z.string(),
  lastName: z.string(),
  email: EmailSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  score: z.number().int().min(0).max(100),
  lifetimeValue: z.number().min(0),
  stage: z.nativeEnum(ContactStage),
  custom: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Organization schemas
export const OrganizationSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  name: z.string(),
  type: z.nativeEnum(OrganizationType),
  website: z.string().url().optional(),
  location: z.string().optional(),
  custom: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Donation schemas
export const DonationSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  contactId: UuidSchema.optional(),
  organizationId: UuidSchema.optional(),
  campaignId: UuidSchema.optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  date: z.date(),
  thankYouStatus: z.nativeEnum(ThankYouStatus),
  custom: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Campaign schemas
export const CampaignSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  name: z.string(),
  targetAmount: z.number().positive(),
  startDate: z.date(),
  endDate: z.date(),
  custom: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Grant schemas
export const GrantAppSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  organizationId: UuidSchema,
  name: z.string(),
  amountRequested: z.number().positive(),
  status: z.nativeEnum(GrantStatus),
  deadline: z.date(),
  notes: z.string().optional(),
  custom: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Pipeline schemas
export const PipelineEventSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  contactId: UuidSchema,
  stage: z.nativeEnum(ContactStage),
  note: z.string().optional(),
  occurredAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Staff schemas
export const StaffSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  name: z.string(),
  role: z.string(),
  email: EmailSchema.optional(),
  phone: z.string().optional(),
  team: z.nativeEnum(StaffTeam),
  custom: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// File schemas
export const FileAssetSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  key: z.string(),
  bucket: z.string(),
  contentType: z.string(),
  size: z.number().positive(),
  source: z.nativeEnum(FileSource),
  meta: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Report schemas
export const ReportSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  name: z.string(),
  sql: z.string(),
  createdBy: UuidSchema,
  lastRunAt: z.date().optional(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Audit log schemas
export const AuditLogSchema = z.object({
  id: UuidSchema,
  tenantId: UuidSchema,
  userId: UuidSchema.optional(),
  action: z.string(),
  entity: z.string(),
  entityId: UuidSchema.optional(),
  meta: z.record(z.any()).optional(),
  ip: z.string().optional(),
  ua: z.string().optional(),
  createdAt: z.date(),
});

// API request/response schemas
export const CreateTenantRequestSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).max(50),
  branding: TenantBrandingSchema.optional(),
});

export const UpdateTenantRequestSchema = z.object({
  name: z.string().min(1).optional(),
  branding: TenantBrandingSchema.optional(),
  settings: TenantSettingsSchema.optional(),
});

export const CreateContactRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: EmailSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  stage: z.nativeEnum(ContactStage).default(ContactStage.IDENTIFIED),
  custom: z.record(z.any()).optional(),
});

export const UpdateContactRequestSchema = CreateContactRequestSchema.partial();

export const CreateDonationRequestSchema = z.object({
  contactId: UuidSchema.optional(),
  organizationId: UuidSchema.optional(),
  campaignId: UuidSchema.optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  date: z.date(),
  thankYouStatus: z.nativeEnum(ThankYouStatus).default(ThankYouStatus.NONE),
  custom: z.record(z.any()).optional(),
});

export const UpdateDonationRequestSchema = CreateDonationRequestSchema.partial();

export const GenerateReportRequestSchema = z.object({
  prompt: z.string().min(1),
  module: z.string().optional(),
});

export const RunReportRequestSchema = z.object({
  sql: z.string().min(1),
  limit: z.number().int().positive().max(1000).default(100),
});

// Type exports
export type Tenant = z.infer<typeof TenantSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserTenant = z.infer<typeof UserTenantSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type Donation = z.infer<typeof DonationSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type GrantApp = z.infer<typeof GrantAppSchema>;
export type PipelineEvent = z.infer<typeof PipelineEventSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type FileAsset = z.infer<typeof FileAssetSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

export type CreateTenantRequest = z.infer<typeof CreateTenantRequestSchema>;
export type UpdateTenantRequest = z.infer<typeof UpdateTenantRequestSchema>;
export type CreateContactRequest = z.infer<typeof CreateContactRequestSchema>;
export type UpdateContactRequest = z.infer<typeof UpdateContactRequestSchema>;
export type CreateDonationRequest = z.infer<typeof CreateDonationRequestSchema>;
export type UpdateDonationRequest = z.infer<typeof UpdateDonationRequestSchema>;
export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;
export type RunReportRequest = z.infer<typeof RunReportRequestSchema>;

// Database connection types
export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  maxConnections: number;
}

// AWS configuration types
export interface AWSConfig {
  region: string;
  cognito: {
    userPoolId: string;
    clientId: string;
    domain: string;
  };
  s3: {
    bucket: string;
    region: string;
  };
  sqs: {
    queueUrl: string;
  };
  bedrock: {
    modelId: string;
    region: string;
  };
}

// JWT payload type
export interface JWTPayload {
  sub: string;
  email: string;
  'cognito:username': string;
  'cognito:groups': string[];
  tenantId?: string;
  iat: number;
  exp: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Custom field types
export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  module: string;
  tenantId: string;
}

// Demo tenant configuration
export interface DemoTenantConfig {
  name: string;
  slug: string;
  palette: string[];
  logoUrl?: string;
  users: Array<{
    email: string;
    password: string;
    role: UserRole;
    imageUrl?: string;
  }>;
}

export const DEMO_TENANTS: DemoTenantConfig[] = [
  {
    name: 'MAKE Literary Productions, NFP',
    slug: 'makelit',
    palette: ['#111827', '#0ea5e9', '#fbbf24', '#f8fafc'],
    logoUrl: '/brand/makelit-logo.png',
    users: [
      { email: 'owner@makelit.org', password: 'Demo!Make', role: UserRole.OWNER },
      { email: 'admin@makelit.org', password: 'Demo!Make', role: UserRole.ADMIN },
      { email: 'editor@makelit.org', password: 'Demo!Make', role: UserRole.EDITOR },
      { email: 'viewer@makelit.org', password: 'Demo!Make', role: UserRole.VIEWER },
    ],
  },
  {
    name: '1in6',
    slug: 'oneinsix',
    palette: ['#0b3d91', '#1f73b7', '#f2f5f7', '#0f172a'],
    logoUrl: '/brand/1in6.svg',
    users: [
      { email: 'owner@oneinsix.org', password: 'Demo!One6', role: UserRole.OWNER },
      { email: 'admin@oneinsix.org', password: 'Demo!One6', role: UserRole.ADMIN },
      { email: 'editor@oneinsix.org', password: 'Demo!One6', role: UserRole.EDITOR },
      { email: 'viewer@oneinsix.org', password: 'Demo!One6', role: UserRole.VIEWER },
    ],
  },
  {
    name: 'Fallen Fruit',
    slug: 'fallenfruit',
    palette: ['#e11d48', '#f97316', '#fef3c7', '#111827'],
    logoUrl: '/brand/fallenfruit.svg',
    users: [
      { email: 'owner@fallenfruit.org', password: 'Demo!Fruit', role: UserRole.OWNER },
      { email: 'admin@fallenfruit.org', password: 'Demo!Fruit', role: UserRole.ADMIN },
      { email: 'editor@fallenfruit.org', password: 'Demo!Fruit', role: UserRole.EDITOR },
      { email: 'viewer@fallenfruit.org', password: 'Demo!Fruit', role: UserRole.VIEWER },
    ],
  },
  {
    name: 'Homeboy Industries',
    slug: 'homeboy',
    palette: ['#0f172a', '#38bdf8', '#e2e8f0', '#1f2937'],
    logoUrl: '/brand/homeboy.svg',
    users: [
      { email: 'owner@homeboy.org', password: 'Demo!Homeboy', role: UserRole.OWNER },
      { email: 'admin@homeboy.org', password: 'Demo!Homeboy', role: UserRole.ADMIN },
      { email: 'editor@homeboy.org', password: 'Demo!Homeboy', role: UserRole.EDITOR },
      { email: 'viewer@homeboy.org', password: 'Demo!Homeboy', role: UserRole.VIEWER },
    ],
  },
  {
    name: 'Tokyo Voice AI CRM - Hack the Daily Life at Ameba',
    slug: 'tokyo-voice-ai',
    palette: ['#ff6b35', '#f7931e', '#ffd23f', '#06ffa5', '#118ab2'],
    logoUrl: '/brand/tokyo-voice-ai.svg',
    users: [
      { email: 'jonathan@tokyo-voice-ai.com', password: 'Demo!Tokyo', role: UserRole.OWNER },
      { email: 'amit@tokyo-voice-ai.com', password: 'Demo!Tokyo', role: UserRole.ADMIN },
      { email: 'tatsuya@tokyo-voice-ai.com', password: 'Demo!Tokyo', role: UserRole.EDITOR },
      { email: 'natsuko@tokyo-voice-ai.com', password: 'Demo!Tokyo', role: UserRole.EDITOR },
      { email: 'yosuke@tokyo-voice-ai.com', password: 'Demo!Tokyo', role: UserRole.ADMIN, imageUrl: '/avatars/yosuke-yasuda.svg' },
    ],
  },
];
