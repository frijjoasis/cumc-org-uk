import { Sequelize } from 'sequelize';
import { logger } from '../logger';

// Import model modules
import * as UserModule from './models/user';
import * as MemberModule from './models/member';
import * as MeetModule from './models/meet';
import * as SignupModule from './models/signup';
import * as BritRockModule from './models/britrock';
import * as CommitteeModule from './models/committee';
import * as CommitteeRoleModule from './models/committeeRole';

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
  logging: false,
});

interface ModelModule {
  define: (sequelize: Sequelize) => any;
  associate: (sequelize: Sequelize) => void;
}

const models: ModelModule[] = [
  UserModule,
  MemberModule,
  MeetModule,
  SignupModule,
  BritRockModule,
  CommitteeModule,
  CommitteeRoleModule,
];

async function init(): Promise<void> {
  await sequelize.authenticate();
  logger.info('Database connection established.');

  // Initialize all models - Model.init() automatically registers them on sequelize.models
  models.forEach(modelModule => {
    modelModule.define(sequelize);
  });

  // Setup associations after all models are defined
  models.forEach(modelModule => {
    modelModule.associate(sequelize);
  });

  await sequelize.sync();
  logger.info('All models synchronized successfully.');
}

// Export the Model classes with "Model" suffix to avoid conflicts
export const UserModel = UserModule.User;
export const MemberModel = MemberModule.Member;
export const MeetModel = MeetModule.Meet;
export const SignupModel = SignupModule.Signup;
export const BritRockModel = BritRockModule.BritRock;
export const CommitteeModel = CommitteeModule.Committee;
export const CommitteeRoleModel = CommitteeRoleModule.CommitteeRole;

// Export additional exports from user and signup modules
export const required = UserModule.required;
export const userFields = SignupModule.userFields;

export { init, sequelize };

// Export types with clean names (no "Model" suffix)
export type {
  User,
  Member,
  Meet,
  Signup,
  Committee,
  CommitteeRole,
  BritRock,
  MeetType,
  SignupControl,
} from './types';
