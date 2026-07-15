export type Role = 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'SITE_VISIT_PLANNED'
  | 'SITE_VISIT_COMPLETED'
  | 'QUOTATION_PENDING'
  | 'QUOTATION_SENT'
  | 'WON'
  | 'LOST';

export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'WALK_IN' | 'SOCIAL_MEDIA' | 'ADVERTISEMENT' | 'OTHERS';

export type PropertyType = 'APARTMENT' | 'VILLA' | 'HOUSE' | 'OFFICE' | 'COMMERCIAL';

export type DealStage =
  | 'DISCUSSION'
  | 'REQUIREMENT_GATHERING'
  | 'SITE_MEASUREMENT'
  | 'DESIGN'
  | 'QUOTATION'
  | 'NEGOTIATION'
  | 'CONFIRMED'
  | 'LOST';

export interface User {
  id: string;
  employeeName: string;
  email: string;
  mobile: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LeadActivity {
  id: string;
  message: string;
  createdAt: string;
  user?: { employeeName: string };
}

export interface Lead {
  id: string;
  leadNumber: string;
  customerName: string;
  mobile: string;
  email?: string;
  location?: string;
  propertyType: PropertyType;
  propertySize?: number;
  budget?: number;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  assignedToId: string;
  assignedTo?: { id: string; employeeName: string; role: Role };
  createdAt: string;
  updatedAt: string;
  activities?: LeadActivity[];
  deal?: Deal | null;
}

export interface DealActivity {
  id: string;
  message: string;
  createdAt: string;
  user?: { employeeName: string };
}

export interface Deal {
  id: string;
  dealNumber: string;
  leadId: string;
  customerName: string;
  propertyType: PropertyType;
  estimatedBudget: number;
  expectedClosureDate: string;
  probability: number;
  stage: DealStage;
  lostReason?: string;
  assignedToId: string;
  assignedTo?: { id: string; employeeName: string; role: Role };
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  lead?: Partial<Lead>;
  activities?: DealActivity[];
}

export interface DashboardSummary {
  leads: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    pendingSiteVisits: number;
    quotationsPending: number;
    quotationsSent: number;
    wonLeads: number;
    lostLeads: number;
    conversionRate: number;
  };
  deals: {
    totalDeals: number;
    activeDeals: number;
    dealsByStage: Record<string, number>;
    confirmedDeals: number;
    lostDeals: number;
    totalPipelineValue: number;
    expectedRevenue: number;
    winRatio: number;
    averageDealValue: number;
  };
}
