import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  ForeignKey,
} from 'sequelize';
import type { UserModel } from './user.js';
import type { SignupModel } from './signup.js';
import { Meet } from '@cumc/shared-types';

class MeetModel extends Model<
  InferAttributes<MeetModel>,
  InferCreationAttributes<MeetModel>
> implements Meet {
  declare id: CreationOptional<number>;
  declare title: string;
  declare subtitle: string | null;
  declare desc: string | null;
  declare startDate: Date;
  declare endDate: Date;
  declare type: 'Indoor' | 'Outdoor' | 'Social' | 'Other';
  declare signupControl: CreationOptional<'Default' | 'Members' | 'Everyone'>;
  declare location: string | null;
  declare disabled: boolean;
  declare questions: object | null;
  declare price: number | null;
  declare maxSignups: number | null;
  declare hidden: CreationOptional<boolean>;
  // Foreign keys
  declare organiser: ForeignKey<UserModel['id']>;

  // Associations
  declare signupCount?: NonAttribute<number>;
  declare organiserUser?: NonAttribute<UserModel>;
  declare signups?: NonAttribute<SignupModel[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize): typeof MeetModel {
  MeetModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      subtitle: DataTypes.STRING,
      desc: DataTypes.TEXT,
      location: DataTypes.STRING,
      startDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      endDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      type: {
        allowNull: false,
        type: DataTypes.ENUM('Indoor', 'Outdoor', 'Social', 'Other'),
      },
      signupControl: {
        allowNull: false,
        type: DataTypes.ENUM('Default', 'Members', 'Everyone'),
        defaultValue: 'Default',
      },
      disabled: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      questions: DataTypes.JSONB,
      price: DataTypes.FLOAT,
      maxSignups: DataTypes.INTEGER,
      
      hidden: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'Meets',
      modelName: 'meet',
      timestamps: true, 
    }
  );

  return MeetModel;
}

function associate(sequelize: Sequelize): void {
  const { user, signup } = sequelize.models;

  if (user) {
    MeetModel.belongsTo(user as typeof UserModel, {
      foreignKey: {
        name: 'organiser',
        allowNull: false,
      },
      as: 'organiserUser',
    });
  }

  if (signup) {
    MeetModel.hasMany(signup as typeof SignupModel, {
      foreignKey: {
        name: 'meetID',
        allowNull: false,
      },
      as: 'signups', 
    });
  }
}

export { MeetModel, define, associate };