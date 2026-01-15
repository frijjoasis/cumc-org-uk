import { Op } from 'sequelize';
import { UserModel, MemberModel, required } from '../database/database';
import type { User } from '../database/types';

class UserService {
  async upsert(userData: Partial<User>): Promise<[UserModel, boolean | null]> {
    return UserModel.upsert(userData);
  }

  async updateInfo(userData: Partial<User>, id: number): Promise<[number]> {
    // Get all nullable fields from User model
    const fields = Object.keys(UserModel.getAttributes()).filter(
      col => UserModel.getAttributes()[col].allowNull !== false
    );

    return [
      await UserModel.update(userData, {
        where: { id },
        fields: fields as any,
        returning: false,
      }).then(v => v[0]),
    ];
  }

  async list(): Promise<UserModel[]> {
    return UserModel.findAll({
      include: {
        model: MemberModel,
        attributes: ['hasPaid', 'committee'],
      },
    });
  }

  async getById(id: number): Promise<UserModel | null> {
    return UserModel.findByPk(id);
  }

  async getWithMember(id: number): Promise<UserModel | null> {
    return UserModel.findByPk(id, {
      include: {
        model: MemberModel,
        attributes: ['hasPaid'],
      },
    });
  }

  async isProfileIncomplete(id: number): Promise<boolean> {
    // If it's the Dev Admin, the profile is never "incomplete"
    if (id === 999999999 && process.env.NODE_ENV === 'development')
      return false;

    const user = await this.getById(id);
    if (!user) return true;

    return !required.every(field => {
      const value = user[field as keyof User];
      return value !== null && value !== undefined && value !== '';
    });
  }

  async getRequiredFields(): Promise<string[]> {
    return required;
  }
  async listSimple(): Promise<Partial<UserModel>[]> {
    return UserModel.findAll({
      attributes: ['id', 'displayName', 'email'],
      order: [['displayName', 'ASC']],
    });
  }

  async getByCrsidOrId(query: string): Promise<UserModel | null> {
    let input = query.toLowerCase().trim();

    if (input.includes('@')) {
      input = input.split('@')[0];
    }
    const cleanQuery = input.replace(/[^a-z0-9]/g, '');

    if (!cleanQuery) return null;

    const numericId = parseInt(cleanQuery);

    return UserModel.findOne({
      where: {
        [Op.or]: [
          { id: isNaN(numericId) ? -1 : numericId },
          { email: { [Op.like]: `${cleanQuery}@cam.ac.uk` } },
        ],
      },
      attributes: ['id', 'displayName', 'email'],
    });
  }
}
export const userService = new UserService();
