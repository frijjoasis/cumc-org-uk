import { MeetModel, SignupModel, UserModel } from '../database/database';
import type { MeetType } from '../database/types';
import { Op } from 'sequelize';

interface MeetCreateData {
  title: string;
  subtitle?: string;
  desc?: string;
  startDate: Date;
  endDate: Date;
  type: MeetType;
  signupControl?: 'Default' | 'Members' | 'Everyone';
  disabled: boolean;
  questions?: object;
  price?: number;
  hidden?: boolean;
}

class MeetService {
  async getAllUpcoming(): Promise<MeetModel[]> {
    return MeetModel.findAll({
      where: {
        startDate: {
          [Op.gte]: new Date(),
        },
      },
    });
  }

  async getAll(): Promise<MeetModel[]> {
    return MeetModel.findAll();
  }

  async getById(id: number): Promise<MeetModel | null> {
    return MeetModel.findByPk(id, {
      include: [
        {
          model: SignupModel,
          include: [
            {
              model: UserModel,
              attributes: ['email'],
            },
          ],
        },
        {
          model: UserModel,
          as: 'organiserUser',
          attributes: ['email', 'firstName', 'lastName', 'phone'],
        },
      ],
    });
  }

  async getByIdRestricted(id: number): Promise<MeetModel | null> {
    // Same as above but don't reveal user answers
    return MeetModel.findByPk(id, {
      include: [
        {
          model: SignupModel,
          attributes: ['displayName'],
          include: [
            {
              model: UserModel,
              attributes: ['email'],
            },
          ],
        },
        {
          model: UserModel,
          as: 'organiserUser',
          attributes: ['email', 'firstName', 'lastName', 'phone'],
        },
      ],
    });
  }

  async create(
    data: MeetCreateData,
    organiserId: string
  ): Promise<[MeetModel, boolean | null]> {
    return MeetModel.upsert({
      ...data,
      organiser: organiserId,
    });
  }

  async updateQuestions(
    id: string | number,
    questions: object
  ): Promise<number> {
    const [affectedCount] = await MeetModel.update(
      { questions },
      {
        where: { id },
      }
    );
    return affectedCount;
  }

  async delete(id: number): Promise<number> {
    return MeetModel.destroy({
      where: { id },
    });
  }
}

export const meetService = new MeetService();
