const { DataTypes, sql } = require('@sequelize/core');
const sequelize = require('../config/database');

const Entreprise = sequelize.define('Entreprise', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: sql.uuidV4,
    allowNull: false,
    unique: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  siret: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
    validate: {
      len: [14, 14],
      isNumeric: true
    }
  },
}, {
  timestamps: true,
  tableName: 'entreprises',
});

// Méthodes de classe
Entreprise.findByUuid = function(uuid) {
  return this.findOne({ where: { uuid } });
};

Entreprise.findBySiret = function(siret) {
  return this.findOne({ where: { siret } });
};

module.exports = Entreprise;