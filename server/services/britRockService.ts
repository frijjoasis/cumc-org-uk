import { BritRock } from '@cumc/shared-types';
import {BritRockModel } from '../database/database.js';

interface BritRockData {
  name: string;
  email: string;
  ticket: string;
}

class BritRockService {
  async upsert(data: BritRockData): Promise<[BritRock, boolean | null]> {
    return BritRockModel.upsert(data);
  }

  async getAll(): Promise<BritRock[]> {
    return BritRockModel.findAll();
  }

  async getByEmail(email: string): Promise<BritRock | null> {
    return BritRockModel.findOne({ where: { email } });
  }
}

export const britRockService = new BritRockService();
