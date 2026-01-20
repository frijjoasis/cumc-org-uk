import { Sequelize } from 'sequelize';
import { logger } from '../logger.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import * as UserModule from './models/user.js';
import * as MemberModule from './models/member.js';
import * as MeetModule from './models/meet.js';
import * as SignupModule from './models/signup.js';
import * as BritRockModule from './models/britrock.js';
import * as CommitteeModule from './models/committee.js';
import * as CommitteeRoleModule from './models/committeeRole.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
  logging: msg => logger.debug(msg),
});

interface ModelModule {
  define: (sequelize: Sequelize) => any;
  associate: (sequelize: Sequelize) => void;
}

const modules: ModelModule[] = [
  UserModule,
  MemberModule,
  MeetModule,
  SignupModule,
  BritRockModule,
  CommitteeModule,
  CommitteeRoleModule,
];

async function init(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established.');

    for (const modelModule of modules) {
      modelModule.define(sequelize);
    }

    for (const modelModule of modules) {
      if (typeof modelModule.associate === 'function') {
        modelModule.associate(sequelize);
      }
    }

    const isDev = process.env.NODE_ENV !== 'production';
    await sequelize.sync({ alter: isDev });

    logger.info('All models synchronized successfully.');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export const required = UserModule.required;
export const userFields = SignupModule.userFields;

export { init, sequelize };

export * from './models/index.js';
