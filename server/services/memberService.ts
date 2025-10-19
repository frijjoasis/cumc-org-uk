import { Member, MemberModel, UserModel } from '../database/database';
import { Op } from 'sequelize';

class MemberService {
  async getById(id: number): Promise<MemberModel | null> {
    return MemberModel.findByPk(id);
  }

  async getCommitteeRole(id: number): Promise<string | null> {
    const member = await MemberModel.findByPk(id);
    return member?.committee ?? null;
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
    id: number,
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
    id: number;
    hasPaid?: boolean;
    hasFree?: boolean;
    paymentID?: string;
    committee?: string;
  }): Promise<[MemberModel, boolean | null]> {
    return MemberModel.upsert(data);
  }
}

export const memberService = new MemberService();
