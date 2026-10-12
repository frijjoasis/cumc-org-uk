import { Op } from 'sequelize';
import { UserModel, MemberModel, required } from '../database/database.js';
import type { User } from '@cumc/shared-types';

type UserUpsertPayload = Partial<User> & {
  id: string;
  email: string;
  displayName: string;
};

class UserService {
  async upsert(
    userData: UserUpsertPayload
  ): Promise<[UserModel, boolean | null]> {
    return UserModel.upsert(userData);
  }
  async updateInfo(
    userData: Partial<Omit<User, 'id'>>,
    id: string
  ): Promise<[number]> {
    const attributes = UserModel.getAttributes();
    const allowedFields = (
      Object.keys(attributes) as Array<keyof typeof attributes>
    ).filter(
      (col: keyof typeof attributes) =>
        attributes[col].allowNull !== false && col !== 'id'
    );

    const [affectedCount] = await UserModel.update(userData, {
      where: { id },
      fields: allowedFields as any,
    });

    return [affectedCount];
  }

  async list(): Promise<UserModel[]> {
    return UserModel.findAll({
      include: [
        {
          model: MemberModel,
          as: 'member',
          attributes: ['hasPaid', 'committee'],
        },
      ],
    });
  }

  async getById(id: string): Promise<UserModel | null> {
    return UserModel.findByPk(id);
  }

  async getWithMember(id: string): Promise<UserModel | null> {
    return UserModel.findByPk(id, {
      include: [
        {
          model: MemberModel,
          as: 'member',
          attributes: ['hasPaid'],
        },
      ],
    });
  }

  async getMissingProfileFields(id: string): Promise<string[]> {
    const user = await this.getById(id);
    if (!user) return [...required];

    return required.filter(field => {
      const value = user.get(field as keyof UserModel);
      return value === null || value === undefined || value === '';
    });
  }

  async isProfileIncomplete(id: string): Promise<boolean> {
    return (await this.getMissingProfileFields(id)).length > 0;
  }

  async getRequiredFields(): Promise<readonly string[]> {
    return required;
  }

  async listSimple(): Promise<UserModel[]> {
    return UserModel.findAll({
      attributes: ['id', 'displayName', 'email'],
      order: [['displayName', 'ASC']],
    });
  }

  async getByCrsidOrId(query: string): Promise<UserModel | null> {
    const input = query.toLowerCase().trim();
    const token = input.split('@')[0].replace(/[^a-z0-9]/g, '');
    if (!token) return null;

    // Users.id is DECIMAL -- only compare against it when the token is numeric,
    // otherwise Postgres errors on 'invalid input syntax for type numeric'.
    const where: any = {
      [Op.or]: [{ email: { [Op.iLike]: `${token}@cam.ac.uk` } }],
    };
    if (/^\d+$/.test(token)) where[Op.or].push({ id: token });

    return UserModel.findOne({
      where,
      attributes: ['id', 'displayName', 'email'],
    });
  }
}

export const userService = new UserService();
