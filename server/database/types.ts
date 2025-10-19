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

export type User = InferAttributes<UserModel>;
export type Member = InferAttributes<MemberModel>;
export type Meet = InferAttributes<MeetModel>;
export type Signup = InferAttributes<SignupModel>;
export type Committee = InferAttributes<CommitteeModel>;
export type CommitteeRole = InferAttributes<CommitteeRoleModel>;
export type BritRock = InferAttributes<BritRockModel>;

// Re-export enum types
export type MeetType = Meet['type'];
export type SignupControl = Meet['signupControl'];
