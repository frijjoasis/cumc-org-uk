import { MeetType, User } from '@/types/models';

export interface MeetContent {
  id: number;
  title?: string;
  type: MeetType;
  disabled: boolean;
  startDate?: string;
  endDate?: string;
  questions?: Question[];
  signups?: SignupData[];
  user?: User;
}

export interface Question {
  /** Older meets have numeric IDs; new questions get UUIDs. */
  id: number | string;
  title: string;
  required?: boolean;
  text?: string;
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
