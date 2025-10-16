import { User } from './models';

export interface Question {
  id: number;
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

export interface MeetContent {
  title?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  questions?: Question[];
  signups?: SignupData[];
  user?: User | null;
  [key: string]: any;
}
