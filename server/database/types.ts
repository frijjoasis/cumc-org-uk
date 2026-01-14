import type { InferAttributes } from 'sequelize';
import type {
  CommitteeModel,
  CommitteeRoleModel,
  BritRockModel,
  MeetModel,
  UserModel,
  MemberModel,
  SignupModel,
} from './models';

type UserBase = InferAttributes<UserModel>;
type MemberBase = InferAttributes<MemberModel>;

export interface User extends UserBase {
  member?: MemberBase;
}

export interface Member extends MemberBase {
  user?: UserBase;
}
export type Meet = InferAttributes<MeetModel>;
export type Signup = InferAttributes<SignupModel>;
export type Committee = InferAttributes<CommitteeModel>;
export type CommitteeRole = InferAttributes<CommitteeRoleModel>;
export type BritRock = InferAttributes<BritRockModel>;

// Re-export enum types
export type MeetType = Meet['type'];
export type SignupControl = Meet['signupControl'];
