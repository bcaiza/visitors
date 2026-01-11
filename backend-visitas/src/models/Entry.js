import { DataTypes } from 'sequelize';
import sequelize from '../../src/config/database.js';
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
    // Cambiar purpose por purpose_id
    purpose_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'visit_purposes',
        key: 'id',
      },
      comment: 'Motivo de la visita',
    },
    // Cambiar hostDepartment por department_id
    department_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id',
      },
    },
    // El resto de campos igual...
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    hostName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Persona a quien visita',
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
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      defaultValue: 'active',
      comment: 'active = dentro, completed = salió, cancelled = cancelada',
    },
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
      { fields: ['purpose_id'] },
      { fields: ['department_id'] },
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

  Entry.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  Entry.belongsTo(models.VisitPurpose, {
    foreignKey: 'purpose_id',
    as: 'purpose',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

export default Entry;