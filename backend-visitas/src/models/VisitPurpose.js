import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const VisitPurpose = sequelize.define(
  'VisitPurpose',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,  // ⬅️ Esto es suficiente
      comment: 'Nombre del motivo de visita',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del motivo',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si el motivo está activo o no',
    },
  },
  {
    tableName: 'visit_purposes',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
    ],
  }
);

export default VisitPurpose;