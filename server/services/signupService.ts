import { SignupModel, MeetModel, sequelize } from '../database/database';

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

      const signupData = {
        answers: data.answers,
        meetID: data.meetID,
        userID: user.id,
        authID: data.authID,
        captureID: data.captureID,
        displayName: user.displayName,
      };

      if (existingSignup) {
        return await existingSignup.update(signupData, { transaction: t });
      } else {
        return await SignupModel.create(signupData, { transaction: t });
      }
    });
  }

  async updatePayment(id: number, captureID: string): Promise<number> {
    const [affectedCount] = await SignupModel.update(
      { captureID },
      {
        where: { id },
      }
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
      where: {
        userID: userId,
      },
      include: {
        model: MeetModel,
        attributes: ['title', 'startDate', 'type', 'price'],
      },
    });
  }
  async getCountByMeetId(meetID: number): Promise<number> {
    return await SignupModel.count({ where: { meetID } });
  }
}

export const signupService = new SignupService();
