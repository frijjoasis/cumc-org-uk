import {
  CommitteeRoleModel,
  CommitteeModel,
  sequelize,
} from '../database/database.js';
import { QueryTypes } from 'sequelize';

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

interface RoleStatus {
  id: number;
  role_name: string;
  role_slug: string;
  current_members: number;
  max_positions: number;
  is_full: boolean;
  needs_filling: boolean;
}

class CommitteeRoleService {
  // Get all roles
  async getAll(): Promise<CommitteeRoleModel[]> {
    return CommitteeRoleModel.findAll({
      order: [
        ['sort_order', 'ASC'],
        ['role_name', 'ASC'],
      ],
    });
  }

  // Get active roles only
  async getActive(): Promise<CommitteeRoleModel[]> {
    return CommitteeRoleModel.findAll({
      where: { is_active: true },
      order: [
        ['sort_order', 'ASC'],
        ['role_name', 'ASC'],
      ],
    });
  }

  // Get roles with member counts
  async getWithStatus(): Promise<RoleStatus[]> {
    return sequelize.query<RoleStatus>(
      `
      SELECT 
        r.*,
        COUNT(c.id)::int as current_members,
        (COUNT(c.id) >= r.max_positions) as is_full,
        (r.is_required AND COUNT(c.id) = 0) as needs_filling
      FROM "CommitteeRoles" r
      LEFT JOIN "Committee" c ON r.id = c.role_id AND c.is_current = TRUE
      WHERE r.is_active = TRUE
      GROUP BY r.id
      ORDER BY r.sort_order ASC, r.role_name ASC
      `,
      { type: QueryTypes.SELECT }
    );
  }

  // Create role
  async create(data: RoleCreateData): Promise<CommitteeRoleModel> {
    const [role] = await CommitteeRoleModel.upsert({
      ...data,
      is_required: data.is_required || false,
      max_positions: data.max_positions || 1,
      sort_order: data.sort_order || 0,
      is_active: data.is_active !== false,
    });

    return role;
  }

  // Update role
  async update(
    id: number,
    data: Partial<RoleCreateData>
  ): Promise<CommitteeRoleModel | null> {
    const [affectedCount] = await CommitteeRoleModel.update(data, {
      where: { id },
    });

    if (affectedCount === 0) {
      return null;
    }

    return CommitteeRoleModel.findByPk(id);
  }

  // Deactivate role (soft delete)
  async deactivate(id: number): Promise<{ success: boolean; message: string }> {
    // Check if role is in use
    const usageCount = await CommitteeModel.count({
      where: { role_id: id, is_current: true },
    });

    if (usageCount > 0) {
      throw new Error(
        'Cannot delete role that is currently assigned to committee members'
      );
    }

    const [affectedCount] = await CommitteeRoleModel.update(
      { is_active: false },
      { where: { id } }
    );

    if (affectedCount === 0) {
      return { success: false, message: 'Role not found' };
    }

    return { success: true, message: 'Role deactivated successfully' };
  }
}

export const committeeRoleService = new CommitteeRoleService();
