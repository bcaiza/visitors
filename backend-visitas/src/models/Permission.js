import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Permission = sequelize.define(
  'Permission',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    can_view: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    can_create: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    can_edit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    can_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    role_id: {
      type: DataTypes.UUID,
      allowNull: false, 
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  },
  {
    tableName: 'permissions',
    timestamps: true,
  }
);

Permission.associate = (models) => {
  Permission.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
};

Permission.associate = (models) => {
  Permission.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
};

export default Permission;