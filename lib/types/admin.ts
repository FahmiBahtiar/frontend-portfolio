// ==================== HERO SECTION ====================
export interface HeroProfile {
  id: string;
  name: string;
  badge: string;
  titles: string[]; // Network & Telecom Student, Building innovative web solutions, Backend Developer
  passions: string; // e.g., "Coding • Aviation • Mountaineering"
  loginMessage?: string;
  ctaText?: string;
  techStack: Array<{
    callsign: string;
    label: string;
    icon: string;
  }>;
  status: string;
  location: string;
  flightLevel?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  platform: 'github' | 'linkedin' | 'instagram' | 'twitter';
  url: string;
  username: string;
  order: number;
}

// ==================== ABOUT/PORTFOLIO SECTION ====================
export interface LanyardData {
  id: string;
  serviceName: string;
  serviceType: string;
  passportLabel: string;
  type: string;
  countryCode: string;
  passportNo: string;
  surname: string;
  givenNames: string;
  nationality: string;
  placeOfBirth: string;
  sex: 'M' | 'F';
  dateOfBirth: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  avatarUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Passion {
  id: string;
  icon: string; // Icon name from lucide-react
  title: string;
  color?: string;
  description: string;
  stats?: {
    label: string;
    value: string;
  };
  statsLabel?: string;
  statsValue?: string;
  gradient?: string;
  order: number;
}

export interface Highlight {
  id: string;
  icon: string;
  label: string;
  value: string;
  color?: string;
  order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Tools' | 'Other';
  proficiency: number;
  icon?: string;
  color: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillCategory {
  id: string;
  category: 'developer' | 'aviation' | 'mountaineering';
  skills: string[];
}

// ==================== EDUCATION SECTION ====================
export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  gpa: string;
  color?: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  category: 'developer' | 'aviation' | 'mountaineering' | 'other';
  title: string;
  issuer: string;
  date: string;
  icon: string;
  description?: string;
  certificateUrl?: string;
  credentialUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== EXPERIENCE & PROJECTS SECTION ====================
export interface FlightEntry {
  id: string;
  callsign: string;
  company: string; // Main display - company/organization name
  departure: {
    roles: string[];
    highlightedRole: string;
    code: string;
    date: string;
  };
  arrival: {
    status: string;
    code: string;
    date: string;
  };
  projectName: string; // Secondary - project or department
  duration: string; // in months
  flightHours?: string;
  crew: string[]; // technologies
  responsibilities: string[]; // what you did there
  color: string;
  location: string;
  category: string;
  order: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HangarItem {
  id: string;
  category: 'github' | 'flight' | 'mountain';
  name: string;
  model: string;
  classification: string;
  description: string;
  stats?: {
    stars?: number;
    forks?: number;
    watchers?: number;
    altitude?: string;
    duration?: string;
    difficulty?: string;
  };
  specifications: {
    language?: string;
    engine?: string;
    maxSpeed?: string;
    range?: string;
    location?: string;
    date?: string;
    elevation?: string;
  };
  systems: string[];
  url?: string;
  icon: string;
  color: 'cyan' | 'green' | 'purple' | 'orange' | 'blue';
  achievements?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== CONTACT SECTION ====================
export interface ContactFrequency {
  id: string;
  frequency: string; // e.g., "121.5"
  label: string; // EMAIL, PHONE, LINKEDIN, etc.
  value: string; // The actual contact value
  icon: string; // Icon name
  type: 'primary' | 'social';
  color: string;
  link?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== ADMIN USER ====================
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

// ==================== CONTACT MESSAGES SECTION ====================
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'read' | 'unread' | 'replied';
  reply?: string;
  repliedAt?: string;
  isArchived: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== MAINTENANCE SETTINGS ====================
export interface MaintenanceSettings {
  id: string;
  enabled: boolean;
  startAt?: string | null;
  endAt?: string | null;
  note?: string | null;
  title?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== COMMON TYPES ====================
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==================== FORM TYPES ====================
export type CreateHeroProfileInput = Omit<HeroProfile, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateHeroProfileInput = Partial<CreateHeroProfileInput>;

export type CreateEducationInput = Omit<Education, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEducationInput = Partial<CreateEducationInput>;

export type CreateAchievementInput = Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAchievementInput = Partial<CreateAchievementInput>;

export type CreateFlightEntryInput = Omit<FlightEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateFlightEntryInput = Partial<CreateFlightEntryInput>;

export type CreateHangarItemInput = Omit<HangarItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateHangarItemInput = Partial<CreateHangarItemInput>;

export type CreateContactFrequencyInput = Omit<ContactFrequency, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateContactFrequencyInput = Partial<CreateContactFrequencyInput>;

export type CreateContactMessageInput = Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isArchived'>;
export type UpdateContactMessageInput = Partial<Pick<ContactMessage, 'status' | 'reply' | 'isArchived'>>;

// ==================== DASHBOARD STATS ====================
export interface DashboardStats {
  totalProjects: number;
  totalEducation: number;
  totalAchievements: number;
  totalFlightHours: number;
  recentActivities: {
    type: string;
    title: string;
    timestamp: string;
  }[];
}
