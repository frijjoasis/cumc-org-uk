import {
  Committee,
  CommitteeModel,
  CommitteeRoleModel,
  sequelize,
} from '../database/database';
import { Op, QueryTypes } from 'sequelize';

interface CommitteeCreateData {
  year: string;
  role: string;
  role_id?: number;
  person_name: string;
  person_email?: string;
  sort_order?: number;
  is_current?: boolean;
  status?: string;
  staging_year?: string;
}

interface RoleCreateData {
  role_name: string;
  role_slug: string;
  description?: string;
  email_alias?: string;
  is_required?: boolean;
  max_positions?: number;
  sort_order?: number;
  is_active?: boolean;
}

interface PublicCommitteeModel {
  person_name: string;
  year: string;
  role: string;
  image_url?: string;
}

class CommitteeService {
  async getExposedModel(cm: CommitteeModel): Promise<PublicCommitteeModel> {
    return {
      year: cm.year,
      person_name: cm.person_name || 'Unknown Member',
      role: cm.committeeRole?.role_name || cm.role || 'Member',
    };
  }

  async getAdminDetails(
    status: 'current' | 'staged'
  ): Promise<CommitteeModel[]> {
    return CommitteeModel.findAll({
      where: { status },
      include: [{ model: CommitteeRoleModel, as: 'committeeRole' }],
      // Include everything for admin management
    });
  }

  async getCurrent(): Promise<CommitteeModel[]> {
    return CommitteeModel.findAll({
      where: {
        [Op.or]: [{ status: 'current' }, { is_current: true }],
      },
      include: [
        {
          model: CommitteeRoleModel,
          as: 'committeeRole',
          attributes: ['role_name', 'role_slug', 'email_alias', 'description'],
        },
      ],
      order: [
        [
          sequelize.literal(
            'COALESCE("committeeRole"."sort_order", "committee"."sort_order")'
          ),
          'ASC',
        ],
        ['sort_order', 'ASC'],
      ],
    });
  }

  // Get staged committee
  async getStaged(): Promise<CommitteeModel[]> {
    return CommitteeModel.findAll({
      where: { status: 'staged' },
      include: [
        {
          model: CommitteeRoleModel,
          as: 'committeeRole',
          attributes: ['role_name', 'role_slug', 'email_alias', 'description'],
        },
      ],
      order: [
        [
          sequelize.literal(
            'COALESCE("committeeRole"."sort_order", "committee"."sort_order")'
          ),
          'ASC',
        ],
        ['sort_order', 'ASC'],
      ],
    });
  }

  // Get past committees
  async getPast(): Promise<Map<string, CommitteeModel[]>> {
    const committees = await CommitteeModel.findAll({
      where: {
        [Op.or]: [
          { status: 'past' },
          { [Op.and]: [{ is_current: false }, { status: null }] },
        ],
      },
      include: [
        {
          model: CommitteeRoleModel,
          as: 'committeeRole',
          attributes: ['role_name', 'sort_order'],
        },
      ],
      order: [
        ['year', 'DESC'],
        [
          sequelize.literal(
            'COALESCE("committeeRole"."sort_order", "committee"."sort_order")'
          ),
          'ASC',
        ],
      ],
    });

    return this.groupCommitteesByYear(committees);
  }

  async getPastExposed(): Promise<Record<string, PublicCommitteeModel[]>> {
    const pastMap: Map<string, CommitteeModel[]> = await this.getPast();
    const result: Record<string, PublicCommitteeModel[]> = {};

    for (const [year, members] of pastMap.entries()) {
      result[year] = await Promise.all(
        members.map(m => this.getExposedModel(m))
      );
    }
    return result;
  }

  private groupCommitteesByYear(
    committees: CommitteeModel[]
  ): Map<string, CommitteeModel[]> {
    const yearMap = new Map<string, CommitteeModel[]>();

    committees.forEach(committee => {
      const year = committee.year;
      if (!yearMap.has(year)) {
        yearMap.set(year, []);
      }

      // Push committee into year
      yearMap.get(year)!.push(committee);
    });

    return yearMap;
  }

  // Get committee status summary
  async getStatusSummary(): Promise<any[]> {
    return sequelize.query('SELECT * FROM committee_status_summary', {
      type: QueryTypes.SELECT,
    });
  }

  async create(data: any): Promise<CommitteeModel> {
    const roleRecord = await CommitteeRoleModel.findByPk(data.role_id);
    if (!roleRecord) {
      throw new Error('Valid Constitutional Role is required');
    }

    const status = data.status || (data.is_current ? 'current' : 'staged');

    return CommitteeModel.create({
      year: data.year,
      role_id: data.role_id,
      role: roleRecord.role_name,
      person_name: data.person_name,
      person_email: data.person_email,
      sort_order: data.sort_order || 0,
      is_current: data.is_current ?? true,
      status: status,
    });
  }

  async update(id: number, data: any): Promise<CommitteeModel | null> {
    const member = await CommitteeModel.findByPk(id);
    if (!member) return null;

    if (data.is_current !== undefined) {
      data.status = data.is_current ? 'current' : 'staged';
    }

    return member.update(data);
  }

  // Delete committee member
  async delete(id: number): Promise<boolean> {
    const deleted = await CommitteeModel.destroy({
      where: { id },
    });
    return deleted > 0;
  }

  // Transition committee year
  async transitionYear(): Promise<{ success: boolean; message: string }> {
    const transaction = await sequelize.transaction();

    try {
      // Check if there's a staged committee
      const stagedCount = await CommitteeModel.count({
        where: { status: 'staged' },
        transaction,
      });

      if (stagedCount === 0) {
        await transaction.rollback();
        throw new Error('No staged committee found');
      }

      // Archive current committee
      await CommitteeModel.update(
        { status: 'past', is_current: false },
        {
          where: {
            [Op.or]: [{ status: 'current' }, { is_current: true }],
          },
          transaction,
        }
      );

      // Promote staged to current
      await CommitteeModel.update(
        { status: 'current', is_current: true },
        {
          where: { status: 'staged' },
          transaction,
        }
      );

      await transaction.commit();

      return {
        success: true,
        message: 'Committee year transitioned successfully',
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Check if staging is in progress
  async isStagingInProgress(): Promise<boolean> {
    const count = await CommitteeModel.count({
      where: { status: 'staged' },
    });
    return count > 0;
  }

  // Clear staged committee
  async clearStaged(): Promise<number> {
    return CommitteeModel.destroy({
      where: { status: 'staged' },
    });
  }
}

export const committeeService = new CommitteeService();
