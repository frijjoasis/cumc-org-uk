export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  dob: string | null;
  college: string | null;
  phone: string | null;
  address1: string | null;
  address2: string | null;
  postCode: string | null;
  city: string | null;
  country: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  bmc: string | null;
  medicalInfo: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Member {
  id: string;
  hasPaid: boolean;
  hasFree: boolean;
  paymentID: string | null;
  committee: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Meet {
  id: number;
  title: string;
  subtitle: string | null;
  desc: string | null;
  startDate: Date | string;
  endDate: Date | string;
  type: 'Indoor' | 'Outdoor' | 'Social' | 'Other';
  signupControl: 'Default' | 'Members' | 'Everyone';
  location: string | null;
  disabled: boolean;
  questions: Record<string, any> | null;
  price: number | null;
  maxSignups: number | null;
  hidden: boolean;
  organiser: string; // ForeignKey to User.id
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminMeetDetail = Meet & {
  organiserUser?: User;
  signups?: (Signup & { user?: User })[];
};

export interface Signup {
  id: number;
  displayName: string | null;
  authID: string | null;
  captureID: string | null;
  answers: Record<string, any> | null; 
  userID: string;
  meetID: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommitteeRole {
  id: number;
  role_name: string;
  role_slug: string;
  description: string | null;
  email_alias: string | null;
  is_required: boolean | null;
  max_positions: number | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface Committee {
  id: number;
  member_id: string | null; // BIGINT/Numeric handled as string in JS
  year: string;
  role: string;
  person_name: string;
  person_email: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  sort_order: number | null;
  role_id: number | null;
  status: string | null; // 'current' | 'past' | 'staged'
  staging_year: string | null;
}

export interface BritRock {
  id: number;
  name: string;
  email: string;
  ticket: string;
  createdAt?: Date;
  updatedAt?: Date;
}