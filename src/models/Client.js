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
    allowNull: false,
    unique: true,
    // No defaultValue - will be set manually to match User UUID
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
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
  isActif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },  // Limite de requetes par jour
  limiteRequete: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Requette actuel executer
  nbRequetteActuel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
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