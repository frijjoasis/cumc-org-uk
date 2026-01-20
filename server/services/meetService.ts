import { MeetModel, SignupModel, UserModel } from '../database/database.js';
import type { Meet } from '@cumc/shared-types';
import { Op, Sequelize } from 'sequelize';

interface MeetCreateData extends Partial<Meet> {
  title: string;
  startDate: Date;
  endDate: Date;
  type: Meet['type'];
  organiser: string;
}

class MeetService {
  private get signupCountLiteral() {
    return [
      Sequelize.literal(`(
        SELECT COUNT(*)
        FROM "Signups" AS signup
        WHERE signup."meetID" = "meet"."id"
      )`),
      'signupCount',
    ] as const;
  }

  async getAllUpcoming(): Promise<MeetModel[]> {
    return MeetModel.findAll({
      where: {
        startDate: { [Op.gte]: new Date() },
        hidden: false,
      },
      attributes: {
        include: [this.signupCountLiteral],
      },
      order: [['startDate', 'ASC']],
    });
  }

  async getAll(): Promise<MeetModel[]> {
    return MeetModel.findAll({
      attributes: {
        include: [this.signupCountLiteral],
      },
      order: [['startDate', 'ASC']],
    });
  }

  async getById(id: number): Promise<MeetModel | null> {
    return MeetModel.findByPk(id, {
      include: [
        {
          model: SignupModel,
          as: 'signups',
          include: [{ model: UserModel, as: 'user', attributes: ['email'] }],
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
    return MeetModel.findByPk(id, {
      include: [
        {
          model: SignupModel,
          as: 'signups',
          attributes: ['displayName'],
          include: [{ model: UserModel, as: 'user', attributes: ['email'] }],
        },
        {
          model: UserModel,
          as: 'organiserUser',
          attributes: ['email', 'firstName', 'lastName', 'phone'],
        },
      ],
    });
  }

  async getByIdWithSignups(id: string | number) {
    return await MeetModel.findByPk(id, {
      include: [
        {
          model: SignupModel,
          as: 'signups',
          include: [
            {
              model: UserModel,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
      order: [[{ model: SignupModel, as: 'signups' }, 'createdAt', 'ASC']],
    });
  }

  async upsert(
    data: Omit<MeetCreateData, 'organiser'>,
    organiserId: string
  ): Promise<[MeetModel, boolean | null]> {
    return MeetModel.upsert({
      ...data,
      organiser: organiserId,
      disabled: data.disabled ?? false,
    } as any);
  }

  async updateQuestions(
    id: string | number,
    questions: Record<string, any>
  ): Promise<number> {
    const [affectedCount] = await MeetModel.update(
      { questions },
      { where: { id } }
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
