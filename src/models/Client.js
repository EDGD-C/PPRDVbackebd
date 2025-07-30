const { DataTypes, sql } = require('@sequelize/core');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  nomEntreprise: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  entrepriseId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Limite de requetes par jour
  setLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isActif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'clients',
});

// Les associations seront définies dans un fichier séparé pour éviter les dépendances circulaires

// Méthodes d'instance
Client.prototype.isActive = function() {
  return this.isActif;
};

// Méthodes de classe
Client.findByUuid = function(uuid) {
  return this.findOne({ where: { uuid } });
};

Client.findActiveClients = function() {
  return this.findAll({ where: { isActif: true } });
};

Client.findByEntreprise = function(entrepriseId) {
  return this.findAll({ where: { entrepriseId } });
};

module.exports = Client;