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
import type { User } from './user';
import type { Signup } from './signup';
import { MeetType } from '@cumc/shared-types';

class Meet extends Model<InferAttributes<Meet>, InferCreationAttributes<Meet>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare subtitle: string | null;
  declare desc: string | null;
  declare startDate: Date;
  declare endDate: Date;
  declare type: 'Indoor' | 'Outdoor' | 'Social' | 'Other';
  declare signupControl: CreationOptional<'Default' | 'Members' | 'Everyone'>;
  declare disabled: boolean;
  declare questions: object | null;
  declare price: number | null;
  declare hidden: CreationOptional<boolean>;

  // Foreign keys
  declare organiser: ForeignKey<User['id']>;

  // Associations
  declare organiserUser?: NonAttribute<User>;
  declare signups?: NonAttribute<Signup[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize) {
  Meet.init(
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
      questions: DataTypes.JSON,
      price: DataTypes.FLOAT,
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
    }
  );

  return Meet;
}

function associate(sequelize: Sequelize) {
  Meet.belongsTo(sequelize.models.user as typeof User, {
    foreignKey: {
      name: 'organiser',
      allowNull: false,
    },
    as: 'organiserUser',
  });

  Meet.hasMany(sequelize.models.signup as typeof Signup, {
    foreignKey: {
      name: 'meetID',
      allowNull: false,
    },
  });
}

export { Meet, define, associate };
