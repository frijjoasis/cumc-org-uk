import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import { MemberModel } from './member';
import { MeetModel } from './meet';
import { SignupModel } from './signup';

class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
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
  declare member?: NonAttribute<MemberModel>;
  declare meets?: NonAttribute<MeetModel[]>;
  declare signups?: NonAttribute<SignupModel[]>;
}

function define(sequelize: Sequelize) {
  UserModel.init(
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
      modelName: 'user',
      // timestamps: false,
    }
  );

  return UserModel;
}

function associate(sequelize: Sequelize) {
  UserModel.hasOne(sequelize.models.member as typeof MemberModel, {
    foreignKey: {
      name: 'id',
      field: 'id',
    },
  });

  UserModel.hasMany(sequelize.models.meet as typeof MeetModel, {
    foreignKey: {
      name: 'organiser',
      allowNull: false,
    },
  });

  UserModel.hasMany(sequelize.models.signup as typeof SignupModel, {
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

export { UserModel, define, associate, required };
