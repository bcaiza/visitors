import { DataTypes } from 'sequelize';
import sequelize from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Visitor = sequelize.define(
  'Visitor',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photoPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idDocumentPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'visitors',
    timestamps: true,
  }
);

Visitor.associate = (models) => {
  Visitor.hasMany(models.Entry, {
    foreignKey: 'visitor_id',
    as: 'entries',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

export default Visitor;