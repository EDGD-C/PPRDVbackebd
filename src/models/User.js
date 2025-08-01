const { DataTypes, sql } = require('@sequelize/core');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'client'),
    defaultValue: 'client',
    allowNull: false,
  },
  isFirstLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  isActif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'users',
  // instance methods
  instanceMethods: {
    isAdmin() {
      return this.role === 'admin';
    },
    isActive() {
      return this.isActif;
    },
  },
});

// instance methods (modern syntax)
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

User.prototype.isClient = function() {
  return this.role === 'client';
};

User.prototype.isActive = function() {
  return this.isActif;
};

User.prototype.needsPasswordChange = function() {
  return this.isFirstLogin;
};

// class methods
User.findByUuid = function(uuid) {
  return this.findOne({ where: { uuid } });
};

User.findActiveUsers = function() {
  return this.findAll({ where: { isActif: true } });
};

User.findAdmins = function() {
  return this.findAll({ where: { role: 'admin' } });
};

User.findClients = function() {
  return this.findAll({ where: { role: 'client' } });
};

User.findActiveClients = function() {
  return this.findAll({ where: { role: 'client', isActif: true } });
};

module.exports = User; 