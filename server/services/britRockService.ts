import { randomInt } from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import { BritRock, BritRockEvent } from '@cumc/shared-types';
import { BritRockModel, BritRockEventModel } from '../database/database.js';

export type BritRockEventInput = Omit<
  BritRockEvent,
  'id' | 'startsAt' | 'createdAt' | 'updatedAt'
> & { startsAt: Date };

interface TicketData {
  eventID: number;
  name: string;
  email: string;
  captureID: string;
}

const TICKET_ATTEMPTS = 5;

export function generateTicketCode(): string {
  return `${randomInt(100, 1000)}-${randomInt(100, 1000)}`;
}

class BritRockService {
  async getCurrentEvent(): Promise<BritRockEventModel | null> {
    return BritRockEventModel.findOne({ order: [['id', 'DESC']] });
  }

  async createEvent(data: BritRockEventInput): Promise<BritRockEventModel> {
    return BritRockEventModel.create(data);
  }

  async updateEvent(
    id: number,
    data: BritRockEventInput
  ): Promise<BritRockEventModel | null> {
    const event = await BritRockEventModel.findByPk(id);
    return event ? event.update(data) : null;
  }

  async getTickets(eventID: number): Promise<BritRock[]> {
    return BritRockModel.findAll({
      where: { eventID },
      order: [['createdAt', 'ASC']],
    });
  }

  async countTickets(eventID: number): Promise<number> {
    return BritRockModel.count({ where: { eventID } });
  }

  // The unique (eventID, ticket) index catches the rare clash between two
  // buyers drawing the same code, so just draw again
  async createTicket(data: TicketData): Promise<BritRock> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await BritRockModel.create({
          ...data,
          ticket: generateTicketCode(),
        });
      } catch (err) {
        if (!(err instanceof UniqueConstraintError) || attempt >= TICKET_ATTEMPTS) {
          throw err;
        }
      }
    }
  }
}

export const britRockService = new BritRockService();
