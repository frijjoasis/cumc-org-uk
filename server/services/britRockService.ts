import { BritRock, BritRockModel } from '../database/database';

interface BritRockData {
  name: string;
  email: string;
  ticket: string;
}

class BritRockService {
  async upsert(data: BritRockData): Promise<[BritRockModel, boolean | null]> {
    return BritRockModel.upsert(data);
  }

  async getAll(): Promise<BritRockModel[]> {
    return BritRockModel.findAll();
  }

  async getByEmail(email: string): Promise<BritRockModel | null> {
    return BritRockModel.findOne({ where: { email } });
  }
}

export const britRockService = new BritRockService();
