/**
 * Ce fichier définit toutes les associations entre les modèles
 * Il doit être importé après que tous les modèles ont été définis
 */

const User = require('./User');
const Client = require('./Client');
const Entreprise = require('./Entreprise');
// const RequestLimit = require('./RequestLimit');
const PasswordReset = require('./PasswordReset');

// Association entre User et Client (One-to-One)
User.hasOne(Client, {
  foreignKey: 'userId',
  as: 'clientProfile'
});

Client.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Association entre Client et Entreprise
Client.belongsTo(Entreprise, { 
  foreignKey: 'entrepriseId',
  as: 'entreprise'
});

Entreprise.hasMany(Client, { 
  foreignKey: 'entrepriseId',
  as: 'clients'
});

// TODO: Uncomment when RequestLimit and PasswordReset tables are created
// // Association entre Client et RequestLimit (One-to-Many)
// Client.hasMany(RequestLimit, {
//   foreignKey: 'clientId',
//   as: 'requestLimits'
// });

// RequestLimit.belongsTo(Client, {
//   foreignKey: 'clientId',
//   as: 'client'
// });

// // Association entre User et RequestLimit (pour resetBy)
// User.hasMany(RequestLimit, {
//   foreignKey: 'resetBy',
//   as: 'resetRequestLimits'
// });

// RequestLimit.belongsTo(User, {
//   foreignKey: 'resetBy',
//   as: 'resetByUser'
// });

// Association entre User et PasswordReset (One-to-Many)
User.hasMany(PasswordReset, {
  foreignKey: 'userId',
  as: 'passwordResets'
});

PasswordReset.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  Client,
  Entreprise,
  // RequestLimit,
  PasswordReset
};