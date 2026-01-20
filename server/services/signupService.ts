import { Op } from 'sequelize';
import { SignupModel, MeetModel, sequelize } from '../database/database.js';

interface SignupData {
  answers: object;
  meetID: number;
  authID?: string;
  captureID?: string;
}

interface UserData {
  id: string;
  displayName: string;
}

class SignupService {
  async register(data: SignupData, user: UserData): Promise<SignupModel> {
    return await sequelize.transaction(async t => {
      const meet = await MeetModel.findByPk(data.meetID, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!meet) throw new Error('MEET_NOT_FOUND');

      const count = await SignupModel.count({
        where: { meetID: data.meetID },
        transaction: t,
      });

      const existingSignup = await SignupModel.findOne({
        where: { meetID: data.meetID, userID: user.id },
        transaction: t,
      });

      if (!existingSignup && meet.maxSignups && count >= meet.maxSignups) {
        throw new Error('MEET_FULL');
      }

      const signupPayload = {
        answers: data.answers,
        meetID: data.meetID,
        userID: user.id,
        authID: data.authID || null,
        captureID: data.captureID || null,
        displayName: user.displayName,
      };

      if (existingSignup) {
        return await existingSignup.update(signupPayload, { transaction: t });
      } else {
        return await SignupModel.create(signupPayload, { transaction: t });
      }
    });
  }

  async updatePayment(id: number, captureID: string): Promise<number> {
    const [affectedCount] = await SignupModel.update(
      { captureID },
      { where: { id } }
    );
    return affectedCount;
  }

  async delete(id: number): Promise<number> {
    return SignupModel.destroy({
      where: { id },
    });
  }

  async getHistory(userId: string): Promise<SignupModel[]> {
    return SignupModel.findAll({
      where: { userID: userId },
      include: [{
        model: MeetModel,
        as: 'meet', 
        attributes: ['title', 'startDate', 'type', 'price'],
      }],
      order: [[{ model: MeetModel, as: 'meet' }, 'startDate', 'DESC']]
    });
  }

  async getCountByMeetId(meetID: number): Promise<number> {
    return await SignupModel.count({ where: { meetID } });
  }
}

export const signupService = new SignupService();