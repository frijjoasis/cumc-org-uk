import {
  SignupModel,
  MeetModel,
  userFields,
  Signup,
} from '../database/database';

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
  async register(
    data: SignupData,
    user: UserData
  ): Promise<[SignupModel, boolean]> {
    const signup = {
      answers: data.answers,
      meetID: data.meetID,
      userID: Number(user.id),
      authID: data.authID,
      captureID: data.captureID,
      displayName: user.displayName,
    };

    return SignupModel.upsert(signup, {
      fields: userFields as (keyof Signup)[],
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
}

export const signupService = new SignupService();
