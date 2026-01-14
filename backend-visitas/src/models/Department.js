import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Department = sequelize.define(
  'Department',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nombre del departamento',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del departamento',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si el departamento está activo o no',
    },
  },
  {
    tableName: 'departments',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
    ],
  }
);

export default Department;