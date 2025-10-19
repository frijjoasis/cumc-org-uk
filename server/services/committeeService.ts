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

interface LegacyCommitteeFormat {
  head: string[];
  body: string[][];
}

class CommitteeService {
  // Get current committee
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
            'COALESCE("committeeRole"."sort_order", "Committee"."sort_order")'
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
            'COALESCE("committeeRole"."sort_order", "Committee"."sort_order")'
          ),
          'ASC',
        ],
        ['sort_order', 'ASC'],
      ],
    });
  }

  // Get past committees in legacy format
  async getPastInLegacyFormat(): Promise<LegacyCommitteeFormat> {
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
            'COALESCE("committeeRole"."sort_order", "Committee"."sort_order")'
          ),
          'ASC',
        ],
      ],
    });

    if (committees.length === 0) {
      return this.getLegacyHardcodedData();
    }

    return this.convertToLegacyFormat(committees);
  }

  // Convert database format to legacy table format
  private convertToLegacyFormat(
    committees: CommitteeModel[]
  ): LegacyCommitteeFormat {
    const yearMap = new Map<string, Record<string, string[]>>();

    committees.forEach(committee => {
      const year = committee.year;
      if (!yearMap.has(year)) {
        yearMap.set(year, {});
      }
      const yearData = yearMap.get(year)!;
      const roleName = committee.committeeRole?.role_name || committee.role;

      if (!yearData[roleName]) {
        yearData[roleName] = [];
      }
      yearData[roleName].push(committee.person_name);
    });

    const head = [
      'Year',
      'President',
      'Secretary',
      'Treasurer',
      'Gear',
      'Outdoor Meet',
      'Indoor Meet',
      'Alpine and Winter',
      'Competition',
      'Social',
      'Journal',
      'Librarian',
      'Webmaster',
      'Welfare',
    ];
    const body: string[][] = [];

    for (const [year, roles] of yearMap.entries()) {
      const row = [year];

      for (let i = 1; i < head.length; i++) {
        const roleName = head[i];
        const members =
          roles[roleName] ||
          this.getAlternativeRoleMembers(roleName, roles) ||
          [];
        row.push(members.join(' & ') || '');
      }

      body.push(row);
    }

    return { head, body };
  }

  // Helper for alternative role names
  private getAlternativeRoleMembers(
    roleName: string,
    roles: Record<string, string[]>
  ): string[] {
    const alternativeNames: Record<string, string[]> = {
      President: ['Co-President'],
      'Outdoor Meet': [
        'Trad/Alpine Meets Secretary',
        'Sport/Boulder Meets Secretary',
      ],
      'Indoor Meet': ['Indoor Meets Secretary'],
      'Alpine and Winter': ['Trad/Alpine Meets Secretary'],
      Competition: ['Competitions Secretary'],
      Social: ['Social Secretary', 'Postgrad Social Secretary'],
      Journal: ['Journal Editor'],
      Webmaster: ['Webmaster'],
      Welfare: ['Access & Welfare Officer'],
    };

    const alternatives = alternativeNames[roleName] || [];
    for (const alt of alternatives) {
      if (roles[alt]) {
        return roles[alt];
      }
    }
    return [];
  }

  // Legacy hardcoded data as fallback
  private getLegacyHardcodedData(): LegacyCommitteeFormat {
    return {
      head: [
        'Year',
        'President',
        'Secretary',
        'Treasurer',
        'Gear',
        'Outdoor Meet',
        'Indoor Meet',
        'Alpine and Winter',
        'Competition',
        'Social',
        'Journal',
        'Librarian',
        'Webmaster',
        'Welfare',
      ],
      body: [
        [
          '2024-2025',
          'Jade Westfoot & Tessa Mullen',
          'Danylo Mankovsky',
          'Fin Chetham',
          'Inigo Holman',
          'Hermione Boyle & Isaac Miller',
          'Seb Gentile & Rebecca Jesson',
          'Alex Maltby',
          'Nat Tompkins',
          'Oliver Gaskell',
          'Anastasia Marine & Izzie Iveson',
        ],
        // ... rest of hardcoded data
      ],
    };
  }

  // Get committee status summary
  async getStatusSummary(): Promise<any[]> {
    return sequelize.query('SELECT * FROM committee_status_summary', {
      type: QueryTypes.SELECT,
    });
  }

  // Create committee member
  async create(data: CommitteeCreateData): Promise<CommitteeModel> {
    const status =
      data.status || (data.is_current !== false ? 'current' : 'past');

    const [member] = await CommitteeModel.upsert({
      ...data,
      status,
      is_current: data.is_current !== false,
      sort_order: data.sort_order || 0,
    });

    return member;
  }

  // Update committee member
  async update(
    id: number,
    data: CommitteeCreateData
  ): Promise<Committee | null> {
    const [affectedCount] = await CommitteeModel.update(data, {
      where: { id },
    });

    if (affectedCount === 0) {
      return null;
    }

    return CommitteeModel.findByPk(id);
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
