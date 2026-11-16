import { BritRock } from '@cumc/shared-types';
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * A guest ticket for a BritRock event. Tickets sold before events were
 * configurable (up to 2025) are left in the old "BritRock" table.
 */
class BritRockModel
  extends Model<
    InferAttributes<BritRockModel>,
    InferCreationAttributes<BritRockModel>
  >
  implements BritRock
{
  declare id: CreationOptional<number>;
  declare eventID: number;
  declare name: string;
  declare email: string;
  declare ticket: string;
  declare captureID: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize): typeof BritRockModel {
  BritRockModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      eventID: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      ticket: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      captureID: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'BritRockTickets',
      modelName: 'britrock',
      timestamps: true,
      indexes: [{ unique: true, fields: ['eventID', 'ticket'] }],
    }
  );

  return BritRockModel;
}

function associate(): void {}

export { BritRockModel, define, associate };
