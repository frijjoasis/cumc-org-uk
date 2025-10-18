import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import type { Member } from './member';
import type { Meet } from './meet';
import type { Signup } from './signup';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: number;
  declare email: string;
  declare displayName: string;
  declare firstName: string | null;
  declare lastName: string | null;
  declare dob: string | null;
  declare college: string | null;
  declare phone: string | null;
  declare address1: string | null;
  declare address2: string | null;
  declare postCode: string | null;
  declare city: string | null;
  declare country: string | null;
  declare emergencyName: string | null;
  declare emergencyPhone: string | null;
  declare bmc: string | null;
  declare medicalInfo: string | null;

  // Timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare member?: NonAttribute<Member>;
  declare meets?: NonAttribute<Meet[]>;
  declare signups?: NonAttribute<Signup[]>;
}

function define(sequelize: Sequelize) {
  User.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.DECIMAL,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      displayName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      dob: DataTypes.STRING,
      college: DataTypes.STRING,
      phone: DataTypes.STRING,
      address1: DataTypes.STRING,
      address2: DataTypes.STRING,
      postCode: DataTypes.STRING,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      emergencyName: DataTypes.STRING,
      emergencyPhone: DataTypes.STRING,
      bmc: DataTypes.STRING,
      medicalInfo: DataTypes.STRING,

      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'Users',
      // timestamps: false,
    }
  );

  return User;
}

function associate(sequelize: Sequelize) {
  User.hasOne(sequelize.models.member as typeof Member, {
    foreignKey: {
      name: 'id',
      field: 'id',
    },
  });

  User.hasMany(sequelize.models.meet as typeof Meet, {
    foreignKey: {
      name: 'organiser',
      allowNull: false,
    },
  });

  User.hasMany(sequelize.models.signup as typeof Signup, {
    foreignKey: {
      name: 'userID',
      allowNull: false,
    },
  });
}

const required = [
  'firstName',
  'lastName',
  'dob',
  'college',
  'phone',
  'address1',
  'postCode',
  'country',
  'emergencyName',
  'emergencyPhone',
];

export { User, define, associate, required };
