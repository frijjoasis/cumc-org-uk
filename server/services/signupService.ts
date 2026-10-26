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

interface RegisterOptions {
  /**
   * Called under the row lock when the user is already signed up. Only if it
   * returns true is the existing signup's payment replaced with this one.
   */
  canReplacePayment?: (existing: SignupModel) => boolean;
}

class SignupService {
  /**
   * Creates a signup, or replaces the payment on an existing one when
   * `canReplacePayment` allows it. Throws ALREADY_SIGNED_UP otherwise, so a
   * second payment can never overwrite the record of the first.
   */
  async register(
    data: SignupData,
    user: UserData,
    options: RegisterOptions = {}
  ): Promise<{ signup: SignupModel; replacedAuthID: string | null }> {
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

      if (existingSignup) {
        if (!options.canReplacePayment?.(existingSignup)) {
          throw new Error('ALREADY_SIGNED_UP');
        }
        const replacedAuthID = existingSignup.authID;
        const signup = await existingSignup.update(
          { authID: data.authID || null, captureID: data.captureID || null },
          { transaction: t }
        );
        return { signup, replacedAuthID };
      }

      if (meet.maxSignups && count >= meet.maxSignups) {
        throw new Error('MEET_FULL');
      }

      const signup = await SignupModel.create(
        {
          answers: data.answers,
          meetID: data.meetID,
          userID: user.id,
          authID: data.authID || null,
          captureID: data.captureID || null,
          displayName: user.displayName,
        },
        { transaction: t }
      );
      return { signup, replacedAuthID: null };
    });
  }

  async getById(id: number): Promise<SignupModel | null> {
    return SignupModel.findByPk(id);
  }

  async getForUser(
    meetID: number,
    userID: string
  ): Promise<SignupModel | null> {
    return SignupModel.findOne({ where: { meetID, userID } });
  }

  async updateAnswers(id: number, answers: object): Promise<number> {
    const [affectedCount] = await SignupModel.update(
      { answers },
      { where: { id } }
    );
    return affectedCount;
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

  async getCountByMeetId(
    meetID: number,
    options: { excludeUserID?: string } = {}
  ): Promise<number> {
    const where: any = { meetID };
    if (options.excludeUserID) {
      where.userID = { [Op.ne]: options.excludeUserID };
    }
    return await SignupModel.count({ where });
  }
}

export const signupService = new SignupService();