import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  profileImage: text("profile_image"),
  role: text("role").notNull(), // 'Safety', 'Quality', 'Production', 'Logistics', 'Admin'
  permissions: jsonb("permissions").default('[]'), // array of department permissions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kpiData = pgTable("kpi_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  department: text("department").notNull(), // 'Safety', 'Quality', 'Production', 'Logistics'
  date: timestamp("date").notNull().defaultNow(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  target: decimal("target", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  metadata: jsonb("metadata").default('{}'), // additional metrics like days since incident, defect rate, etc.
  updatedBy: varchar("updated_by").notNull().references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const actionItems = pgTable("action_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department: text("department").notNull(),
  priority: text("priority").notNull(), // 'high', 'medium', 'low'
  status: text("status").notNull().default('open'), // 'open', 'in-progress', 'closed'
  assigneeId: varchar("assignee_id").notNull().references(() => users.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  permissions: true,
});

export const insertKpiDataSchema = createInsertSchema(kpiData).omit({
  id: true,
  updatedAt: true,
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertKpiData = z.infer<typeof insertKpiDataSchema>;
export type KpiData = typeof kpiData.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export interface AppState {
  user: User | null;
  actions: ActionItem[];
  kpis: KPI[];
  users: User[];
}

export interface UserManagement {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'user' | 'viewer';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DepartmentManagement {
  id?: number;
  name: string;
  description?: string;
  managerId?: number;
  managerName?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Customer Claims Management Schema
export const customerClaims = pgTable("customer_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  defectType: text("defect_type").notNull(),
  customerClaimNo: text("customer_claim_no").notNull().unique(),
  qualityAlarmNo: text("quality_alarm_no"),
  claimDate: timestamp("claim_date").notNull().defaultNow(),
  gasClaimSapNo: text("gas_claim_sap_no"),
  detectionLocation: text("detection_location"),
  claimCreator: varchar("claim_creator").notNull().references(() => users.id),
  gasPartName: text("gas_part_name"),
  gasPartRefNo: text("gas_part_ref_no"),
  nokQuantity: integer("nok_quantity"),
  claimType: text("claim_type").notNull(), // 'WARRANTY', 'QUALITY', 'DELIVERY', 'OTHER'
  costAmount: decimal("cost_amount", { precision: 12, scale: 2 }),
  currency: text("currency").default('EUR'), // 'EUR', 'USD', 'TL'
  status: text("status").notNull().default('OPEN'), // 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'
  issueDescription: text("issue_description").notNull(),
  ppmType: text("ppm_type"),
  claimRelatedDepartment: text("claim_related_department").notNull(),
  customerRefNo: text("customer_ref_no"),
  gpqNo: text("gpq_no"),
  gpqResponsiblePerson: text("gpq_responsible_person"),
  supplierName: text("supplier_name"),
  hbrNo: text("hbr_no"),
  priority: text("priority").default('MEDIUM'), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolutionDate: timestamp("resolution_date"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const claimAttachments = pgTable("claim_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => customerClaims.id, { onDelete: 'cascade' }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  filePath: text("file_path").notNull(),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const claimWorkflow = pgTable("claim_workflow", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => customerClaims.id, { onDelete: 'cascade' }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  changeReason: text("change_reason"),
  changedAt: timestamp("changed_at").notNull().defaultNow(),
});

export const claimComments = pgTable("claim_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => customerClaims.id, { onDelete: 'cascade' }),
  comment: text("comment").notNull(),
  commentBy: varchar("comment_by").notNull().references(() => users.id),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerClaimSchema = createInsertSchema(customerClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClaimAttachmentSchema = createInsertSchema(claimAttachments).omit({
  id: true,
  uploadedAt: true,
});

export const insertClaimWorkflowSchema = createInsertSchema(claimWorkflow).omit({
  id: true,
  changedAt: true,
});

export const insertClaimCommentSchema = createInsertSchema(claimComments).omit({
  id: true,
  createdAt: true,
});

// Production Stations Schema
export const productionStations = pgTable("production_stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  location: text("location"),
  responsibleId: varchar("responsible_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Station Data Entries Schema (for daily data collection)
export const stationDataEntries = pgTable("station_data_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stationId: varchar("station_id").notNull().references(() => productionStations.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  day: integer("day").notNull(), // Day of month (1-31)
  dataType: text("data_type").notNull(), // 'safety', 'quality', 'production', 'logistics'
  eventType: text("event_type").notNull(), // 'incident', 'defect', 'downtime', 'delay', etc.
  description: text("description").notNull(),
  severity: text("severity").notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  status: text("status").notNull().default('active'), // 'active', 'resolved', 'closed'
  reportedBy: varchar("reported_by").notNull().references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  metadata: jsonb("metadata").default('{}'), // Additional data like quantity, cost, etc.
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductionStationSchema = createInsertSchema(productionStations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStationDataEntrySchema = createInsertSchema(stationDataEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProductionStation = z.infer<typeof insertProductionStationSchema>;
export type ProductionStation = typeof productionStations.$inferSelect;
export type InsertStationDataEntry = z.infer<typeof insertStationDataEntrySchema>;
export type StationDataEntry = typeof stationDataEntries.$inferSelect;

export interface ProductionStationWithResponsible extends ProductionStation {
  responsibleName?: string;
}

export interface StationDataEntryWithDetails extends StationDataEntry {
  stationName: string;
  stationCode: string;
  reportedByName: string;
  assignedToName?: string;
}



export type InsertCustomerClaim = z.infer<typeof insertCustomerClaimSchema>;
export type CustomerClaim = typeof customerClaims.$inferSelect;
export type InsertClaimAttachment = z.infer<typeof insertClaimAttachmentSchema>;
export type ClaimAttachment = typeof claimAttachments.$inferSelect;
export type InsertClaimWorkflow = z.infer<typeof insertClaimWorkflowSchema>;
export type ClaimWorkflow = typeof claimWorkflow.$inferSelect;
export type InsertClaimComment = z.infer<typeof insertClaimCommentSchema>;
export type ClaimComment = typeof claimComments.$inferSelect;