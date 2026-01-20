import type { 
  User, Member, Committee, Meet, Signup, CommitteeRole 
} from './index.js';

export interface UserWithProfile extends User {
  member?: Member;
  organisedMeets?: Meet[];
  signups?: Signup[];
}

export interface MemberWithUser extends Member {
  user?: User;
  committeeMembers?: Committee[];
}

export interface CommitteeWithRole extends Committee {
  member?: Member;
  committeeRole?: CommitteeRole;
}

export interface MeetWithSignups extends Meet {
  organiserUser?: User;
  signups?: Signup[];
}

export interface SignupWithDetails extends Signup {
  user?: User;
  meet?: Meet;
}

export type MeetType = Meet['type'];
export type SignupControl = Meet['signupControl'];