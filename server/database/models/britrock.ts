import { BritRock } from '@cumc/shared-types';
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

class BritRockModel extends Model<
  InferAttributes<BritRockModel>,
  InferCreationAttributes<BritRockModel>
> implements BritRock {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare ticket: string;

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
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'BritRock', 
      modelName: 'britrock',
      timestamps: true, 
    }
  );

  return BritRockModel;
}


function associate(): void {
}

export { BritRockModel, define, associate };