export type MembershipRole = "OWNER" | "ADMIN" | "MEMBER" | "REVIEWER" | "VIEWER";

export type AuthUser = {
  id: string;
  organizationId: string;
  membershipId: string;
  name: string;
  email: string;
  role: MembershipRole;
  organization: {
    id: string;
    name: string;
  };
};

export type AuthResponse = {
  user: AuthUser;
};

export type Organization = {
  id: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  industry: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ClientStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export type ClientContact = {
  id: string;
  clientId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  organizationId: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  industry: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  contacts: ClientContact[];
  _count: {
    contacts: number;
  };
};

export type ClientListResponse = {
  items: Client[];
  summary: {
    active: number;
    paused: number;
    archived: number;
  };
};

export type ClientStats = {
  activeClients: number;
  contacts: number;
};

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export type Plan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  maxClients: number;
  maxActiveWorkspaces: number;
  maxStorageGb: number;
  maxInternalUsers: number;
  maxTemplates: number;
  maxReminders: number;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationSubscription = {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan: Plan;
};

export type PlanUsage = {
  clients: number;
  activeWorkspaces: number;
  storageGb: number;
  internalUsers: number;
  templates: number;
  reminders: number;
};

export type CurrentPlanResponse = {
  subscription: OrganizationSubscription;
  plan: Plan;
  usage: PlanUsage;
  limits: PlanUsage;
};

export type WorkspaceStatus =
  | "DRAFT"
  | "ACTIVE"
  | "WAITING_CLIENT"
  | "IN_REVIEW"
  | "WAITING_APPROVAL"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export type WorkspaceType =
  | "GENERIC_PROCESS"
  | "MONTHLY_CLOSURE"
  | "LEGAL_CASE"
  | "ONBOARDING"
  | "DOCUMENT_REVIEW";

export type Workspace = {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  description: string | null;
  workspaceType: WorkspaceType;
  periodYear: number | null;
  periodMonth: number | null;
  dueDate: string | null;
  status: WorkspaceStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  deletedAt: string | null;
  client: {
    id: string;
    name: string;
    industry: string | null;
    status: ClientStatus;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type WorkspaceListResponse = {
  items: Workspace[];
  summary: {
    draft: number;
    active: number;
    waitingClient: number;
    inReview: number;
    completed: number;
  };
};

export type WorkspaceStats = {
  openWorkspaces: number;
  waitingClient: number;
  dueSoon: number;
};

export type DocumentRequestStatus =
  | "DRAFT"
  | "PENDING"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "OBSERVED"
  | "RESUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "OVERDUE"
  | "CANCELLED";

export type DocumentRequest = {
  id: string;
  organizationId: string;
  workspaceId: string;
  checklistId: string | null;
  title: string;
  description: string | null;
  required: boolean;
  dueDate: string | null;
  status: DocumentRequestStatus;
  assignedClientContactId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: string;
    name: string;
    clientId: string;
    client: {
      id: string;
      name: string;
    };
  };
  assignedClientContact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type DocumentRequestListResponse = {
  items: DocumentRequest[];
  summary: {
    pending: number;
    submitted: number;
    inReview: number;
    observed: number;
    approved: number;
  };
};

export type DocumentStatus =
  | "UPLOADED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "OBSERVED"
  | "REJECTED"
  | "REPLACED"
  | "ARCHIVED";

export type DocumentOrigin =
  | "CLIENT_UPLOAD"
  | "ORGANIZATION_UPLOAD"
  | "SYSTEM_GENERATED";

export type FileAsset = {
  id: string;
  organizationId: string;
  storageProvider: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string | null;
  publicUrl: string | null;
  createdById: string | null;
  uploadedByClientContactId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FileDownloadResponse = {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  expiresInSeconds: number | null;
};

export type DocumentVersion = {
  id: string;
  organizationId: string;
  documentId: string;
  fileAssetId: string;
  versionNumber: number;
  notes: string | null;
  createdById: string | null;
  uploadedByClientContactId: string | null;
  createdAt: string;
  updatedAt: string;
  fileAsset: FileAsset;
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  uploadedByClientContact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
};

export type ReviewDecision = "APPROVED" | "REJECTED";

export type Review = {
  id: string;
  organizationId: string;
  documentId: string;
  decision: ReviewDecision;
  comment: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type Observation = {
  id: string;
  organizationId: string;
  documentId: string;
  documentRequestId: string;
  comment: string;
  resolutionNote: string | null;
  createdById: string;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  resolvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type DocumentFile = {
  id: string;
  organizationId: string;
  documentRequestId: string;
  title: string;
  status: DocumentStatus;
  origin: DocumentOrigin;
  createdById: string | null;
  uploadedByClientContactId: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  archivedAt: string | null;
  versions: DocumentVersion[];
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  uploadedByClientContact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  reviews: Review[];
  observations: Observation[];
};

export type ClientPortalAccessResponse = {
  id: string;
  token?: string;
  code?: string;
  portalPath?: string;
  portalSessionToken?: string;
  requiresCode?: boolean;
  expiresAt: string;
  lastUsedAt: string | null;
  sessionExpiresInSeconds: number;
  organization: {
    id: string;
    name: string;
  };
  workspace: {
    id: string;
    name: string;
    description: string | null;
    dueDate: string | null;
    status: WorkspaceStatus;
  };
  client: {
    id: string;
    name: string;
  };
  clientContact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
};

export type ClientPortalDocumentRequest = Pick<
  DocumentRequest,
  | "id"
  | "organizationId"
  | "workspaceId"
  | "checklistId"
  | "title"
  | "description"
  | "required"
  | "dueDate"
  | "status"
  | "assignedClientContactId"
  | "createdById"
  | "createdAt"
  | "updatedAt"
> & {
  assignedClientContact: DocumentRequest["assignedClientContact"];
  documents: DocumentFile[];
};

export type ClientPortalDocumentRequestListResponse = {
  access: ClientPortalAccessResponse;
  items: ClientPortalDocumentRequest[];
  summary: DocumentRequestListResponse["summary"];
};

export type DocumentListResponse = {
  items: DocumentFile[];
};

export type DeliveryStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "APPROVED"
  | "OBSERVED"
  | "COMPLETED"
  | "CANCELLED";

export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "OBSERVED"
  | "REJECTED";

export type DeliveryItem = {
  id: string;
  organizationId: string;
  deliveryId: string;
  fileAssetId: string;
  title: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  fileAsset: FileAsset;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type Approval = {
  id: string;
  organizationId: string;
  deliveryId: string;
  status: ApprovalStatus;
  comment: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type Delivery = {
  id: string;
  organizationId: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: DeliveryStatus;
  sentAt: string | null;
  viewedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  items: DeliveryItem[];
  approvals: Approval[];
};

export type DeliveryListResponse = {
  items: Delivery[];
  summary: {
    draft: number;
    sent: number;
    approved: number;
    observed: number;
    completed: number;
  };
};

export type ActivityActorType = "USER" | "SYSTEM" | "CLIENT_CONTACT";

export type ActivityLog = {
  id: string;
  organizationId: string;
  workspaceId: string | null;
  actorType: ActivityActorType;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  workspace: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
    };
  } | null;
};

export type ActivityLogListResponse = {
  items: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type ChecklistTemplateItem = {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  required: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistTemplate = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  items: ChecklistTemplateItem[];
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    items: number;
    checklists: number;
  };
};

export type ChecklistTemplateListResponse = {
  items: ChecklistTemplate[];
};

export type AppliedChecklist = {
  id: string;
  organizationId: string;
  workspaceId: string;
  templateId: string | null;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  template: {
    id: string;
    name: string;
  } | null;
  documentRequests: Pick<
    DocumentRequest,
    "id" | "title" | "description" | "required" | "dueDate" | "status"
  >[];
};

export type DashboardRecentWorkspace = Workspace & {
  _count: {
    documentRequests: number;
  };
};

export type DashboardDueRequest = Pick<
  DocumentRequest,
  | "id"
  | "title"
  | "description"
  | "dueDate"
  | "status"
  | "assignedClientContact"
> & {
  workspace: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
    };
  };
};

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  kind: string;
};

export type DashboardSummary = {
  totalClients: number;
  activeWorkspaces: number;
  pendingRequests: number;
  overdueRequests: number;
  completedRequests: number;
  recentWorkspaces: DashboardRecentWorkspace[];
  dueSoonRequests: DashboardDueRequest[];
  recentActivity: DashboardActivity[];
};
