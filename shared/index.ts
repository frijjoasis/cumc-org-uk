export * from './types.js';
export * from './api-types.js';

export interface PublicCommitteeModel {
  person_name: string;
  year: string;
  role: string;
  profile_hash: string;
  cover_hash: string;
  email_alias?: string | null;
}

export interface AdminPublicCommitteeModel extends PublicCommitteeModel {
  id: number;
  role_id: number;
  member_id: string;
  person_email: string | null;
  sort_order: number;
  is_current: boolean;
}
