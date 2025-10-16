// Database model types based on server/database/models/

export interface User {
  id: string; // DECIMAL type from database
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  college?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  postCode?: string;
  city?: string;
  country?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  bmc?: string;
  medicalInfo?: string;
  // Sequelize timestamps (if using timestamps: true)
  createdAt?: Date;
  updatedAt?: Date;
  member?: Member;
}

export interface Member {
  id: string; // DECIMAL type, same as User.id (one-to-one)
  hasPaid: boolean; // Are they up to date on their membership payment?
  hasFree: boolean; // Can they attend one meet before purchasing membership?
  paymentID?: string;
  committee?: string; // Do they hold a committee position?
  // Relations
  user?: User;
  // Sequelize timestamps (if using timestamps: true)
  createdAt?: Date;
  updatedAt?: Date;
}

export type MeetType = 'Indoor' | 'Outdoor' | 'Social' | 'Other';
export type SignupControl = 'Default' | 'Members' | 'Everyone';

export interface Meet {
  id: number;
  title: string;
  subtitle?: string;
  desc?: string; // TEXT field (more than 255 characters)
  startDate: Date;
  endDate: Date;
  type: MeetType;
  signupControl: SignupControl;
  disabled: boolean; // Are signups disabled?
  questions?: any; // JSON field
  price?: number; // FLOAT
  hidden: boolean; // Hide from upcoming menu (not secure, just for UI)
  organiser: string; // Foreign key to User.id
  // Relations
  organiserUser?: User;
  signups?: Signup[];
  // Sequelize timestamps (if using timestamps: true)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Signup {
  id: number;
  displayName?: string;
  authID?: string;
  captureID?: string;
  answers?: any; // JSON field
  userID: string; // Foreign key to User.id
  meetID: number; // Foreign key to Meet.id
  // Relations
  user?: User;
  meet?: Meet;
  // Sequelize timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Committee {
  id: number;
  member_id?: number;
  year: string; // e.g., "2024-2025"
  role: string;
  person_name: string;
  person_email?: string;
  start_date?: string; // DATEONLY
  end_date?: string; // DATEONLY
  is_current?: boolean;
  sort_order?: number;
  role_id?: number;
  status?: string; // e.g., "current", "staged"
  staging_year?: string;
  // Relations
  member?: Member;
  committeeRole?: CommitteeRole;
}

export interface CommitteeRole {
  id: number;
  role_name: string;
  role_slug: string;
  description?: string;
  email_alias?: string;
  is_required?: boolean;
  max_positions?: number;
  sort_order?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  // Relations
  committeeMembers?: Committee[];
}

export interface BritRock {
  id: number;
  name: string;
  email: string;
  ticket: string;
  // Sequelize timestamps (if using timestamps: true)
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper type for when you're creating a new record (without id)
export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type NewMember = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;
export type NewMeet = Omit<Meet, 'id' | 'createdAt' | 'updatedAt'>;
export type NewSignup = Omit<Signup, 'id' | 'createdAt' | 'updatedAt'>;
export type NewCommittee = Omit<Committee, 'id'>;
export type NewCommitteeRole = Omit<
  CommitteeRole,
  'id' | 'created_at' | 'updated_at'
>;
export type NewBritRock = Omit<BritRock, 'id' | 'createdAt' | 'updatedAt'>;
