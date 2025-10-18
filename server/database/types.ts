import type { InferAttributes } from 'sequelize';
import type { User as UserModel } from './models/user';
import type { Member as MemberModel } from './models/member';
import type { Meet as MeetModel } from './models/meet';
import type { Signup as SignupModel } from './models/signup';
import type { Committee as CommitteeModel } from './models/committee';
import type { CommitteeRole as CommitteeRoleModel } from './models/committeeRole';
import type { BritRock as BritRockModel } from './models/britrock';

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
