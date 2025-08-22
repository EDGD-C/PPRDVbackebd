const { DataTypes, sql } = require('@sequelize/core');
const sequelize = require('../config/database');
const crypto = require('crypto');

const PasswordReset = sequelize.define('PasswordReset', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User requesting password reset'
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique token for password reset'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Token expiration time'
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Whether the token has been used'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'IP address of the reset request'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent of the reset request'
  }
}, {
  timestamps: true,
  tableName: 'password_resets',
  indexes: [
    {
      fields: ['token']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

// Instance methods
PasswordReset.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

PasswordReset.prototype.isValid = function() {
  return !this.isUsed && !this.isExpired();
};

PasswordReset.prototype.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// Class methods
PasswordReset.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

PasswordReset.createResetToken = async function(userId, ipAddress = null, userAgent = null) {
  // First, invalidate any existing tokens for this user
  await this.update(
    { isUsed: true },
    { 
      where: { 
        userId, 
        isUsed: false,
        expiresAt: { [sequelize.Sequelize.Op.gt]: new Date() }
      } 
    }
  );

  // Create new token
  const token = this.generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

  return await this.create({
    userId,
    token,
    expiresAt,
    ipAddress,
    userAgent
  });
};

PasswordReset.findValidToken = async function(token) {
  const resetRecord = await this.findOne({
    where: {
      token,
      isUsed: false,
      expiresAt: { [sequelize.Sequelize.Op.gt]: new Date() }
    }
  });

  return resetRecord;
};

PasswordReset.cleanupExpiredTokens = async function() {
  return await this.destroy({
    where: {
      expiresAt: { [sequelize.Sequelize.Op.lt]: new Date() }
    }
  });
};

module.exports = PasswordReset;
