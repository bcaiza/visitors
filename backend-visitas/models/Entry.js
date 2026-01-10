import { DataTypes } from 'sequelize';
import sequelize from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Entry = sequelize.define(
  'Entry',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    visitor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'visitors',
        key: 'id',
      },
    },
    // Entrada
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Salida (inicialmente null)
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Información adicional
    purpose: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Motivo de la visita',
    },
    hostName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Persona a quien visita',
    },
    hostDepartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    badge: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Número de gafete asignado',
    },
    vehiclePlate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    temperature: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'Temperatura corporal si se requiere',
    },
    // Estado
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      defaultValue: 'active',
      comment: 'active = dentro, completed = salió, cancelled = cancelada',
    },
    // Notas
    entryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas al momento de la entrada',
    },
    exitNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas al momento de la salida',
    },
    // Registro de quién atendió
    checkedInBy: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Usuario que registró la entrada',
    },
    checkedOutBy: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Usuario que registró la salida',
    },
  },
  {
    tableName: 'entries',
    timestamps: true,
    indexes: [
      { fields: ['visitor_id'] },
      { fields: ['status'] },
      { fields: ['checkInTime'] },
      { fields: ['checkOutTime'] },
    ],
  }
);

Entry.associate = (models) => {
  Entry.belongsTo(models.Visitor, {
    foreignKey: 'visitor_id',
    as: 'visitor',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default Entry;