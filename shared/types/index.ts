export * from './models';

export interface PublicCommitteeModel {
  person_name: string;
  year: string;
  role: string;
  profile_hash: string;
  cover_hash: string;
  email_alias?: string;
}

export interface AdminPublicCommitteeModel extends PublicCommitteeModel {
  id: number;
  role_id: number;
  member_id: number;
  person_email: string;
  sort_order: number;
  is_current: boolean;
}
