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
import type { Committee } from './committee';

class Member extends Model<
  InferAttributes<Member>,
  InferCreationAttributes<Member>
> {
  // id is both primary key AND foreign key to User
  declare id: ForeignKey<User['id']>;

  declare hasPaid: CreationOptional<boolean>;
  declare hasFree: CreationOptional<boolean>;
  declare paymentID: string | null;
  declare committee: string | null;

  // Associations
  declare user?: NonAttribute<User>;
  declare committeeMembers?: NonAttribute<Committee[]>;

  // Timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize) {
  Member.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.DECIMAL,
      },
      hasPaid: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      hasFree: {
        allowNull: false,
        defaultValue: true,
        type: DataTypes.BOOLEAN,
      },
      paymentID: DataTypes.STRING,
      committee: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'Members',
    }
  );

  return Member;
}

function associate(sequelize: Sequelize) {
  Member.belongsTo(sequelize.models.user as typeof User, {
    foreignKey: {
      name: 'id',
      field: 'id',
    },
  });

  // Associate with committee if it exists
  if (sequelize.models.committee) {
    Member.hasMany(sequelize.models.committee as typeof Committee, {
      foreignKey: 'member_id',
      as: 'committeeMembers',
    });
  }
}

export { Member, define, associate };
