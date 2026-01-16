import { User } from './models';

export interface Question {
  id: number;
  title: string;
  required?: boolean;
  text?: string;
  type?: 'text' | 'checkbox';
  help?: string;
}

export interface Answer {
  id: number;
  value: string;
}

export interface SignupData {
  id: number;
  displayName: string;
  authID?: string;
  captureID?: string;
  userID: string;
  createdAt: string;
  answers: Answer[];
  user: User;
}

export type MeetType = 'Indoor' | 'Outdoor' | 'Social' | 'Other';
export type SignupControl = 'Default' | 'Members' | 'Everyone';

export interface MeetContent {
  id?: number;
  title: string;
  subtitle?: string | null;
  desc?: string | null;
  startDate: string;
  endDate: string;
  type: MeetType;
  signupControl: SignupControl;
  disabled: boolean;
  questions: any[];
  price: number | string;
  hidden: boolean;
  location?: string;
  maxSignups?: number;
  signupCount?: number;
  signups?: any[];
  [key: string]: any;
}
