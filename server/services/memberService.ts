import { Member, MemberModel, UserModel } from '../database/database';
import { CommitteeModel, CommitteeRoleModel } from '../database/models';
import { Op } from 'sequelize';

export interface CommitteeStatus {
  isCommittee: boolean;
  isRoot: boolean;
  roles: string[];
}

class MemberService {
  async getById(id: string): Promise<MemberModel | null> {
    return MemberModel.findByPk(id);
  }

  // Checks the legacy 'committee' column on the Member table 
  async getUserIsRoot(id: string): Promise<boolean> {
    const member = await MemberModel.findByPk(id);
    return member?.committee === 'root';
  }

  async getCommitteeRole(memberId: string): Promise<CommitteeStatus> {
    const currentYear = process.env.CURRENT_YEAR;
    const previousYear = process.env.PREVIOUS_YEAR;

    const committeeRecords = await CommitteeModel.findAll({
      where: { member_id: memberId },
      include: [{ model: CommitteeRoleModel, as: 'committeeRole' }],
    });

    const isHardcodedRoot = await this.getUserIsRoot(memberId);

    const isRoleBasedRoot = committeeRecords.some((record) => {
      const slug = record.committeeRole?.role_slug;
      const year = record.year;

      const isPowerRole = ['president', 'webmaster'].includes(slug || '');
      const isValidYear = [currentYear, previousYear].filter(Boolean).includes(year);

      return isPowerRole && isValidYear;
    });

    const isRoot = isHardcodedRoot || isRoleBasedRoot;

    const currentRoles = committeeRecords.filter((r) => r.is_current === true);
    const isCommittee = isRoot || currentRoles.length > 0;

    const roleNames = currentRoles.map(
      (r) => r.committeeRole?.role_name || 'Unknown Role'
    );

    return {
      isCommittee,
      isRoot,
      roles: roleNames,
    };
  }

  async getCommitteeMembers(): Promise<MemberModel[]> {
    return MemberModel.findAll({
      attributes: ['committee'],
      where: {
        committee: {
          [Op.not]: null,
        },
      },
      include: {
        model: UserModel,
        attributes: ['firstName', 'lastName'],
      },
    });
  }

  async getWithDetails(id: number): Promise<MemberModel | null> {
    return MemberModel.findByPk(id, {
      include: {
        all: true,
      },
    });
  }

  async updateMembership(
    id: string,
    status: boolean
  ): Promise<[MemberModel, boolean | null]> {
    return MemberModel.upsert({
      id,
      hasPaid: status,
    });
  }

  async resetAllMemberships(): Promise<number> {
    const [affectedCount] = await MemberModel.update(
      { hasPaid: false },
      {
        where: {
          hasPaid: true,
        },
      }
    );
    return affectedCount;
  }

  async upsert(data: {
    id: string;
    hasPaid?: boolean;
    hasFree?: boolean;
    paymentID?: string;
    committee?: string;
  }): Promise<[MemberModel, boolean | null]> {
    return MemberModel.upsert(data);
  }
}

export const memberService = new MemberService();