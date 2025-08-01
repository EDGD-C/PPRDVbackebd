/**
 * Ce fichier définit toutes les associations entre les modèles
 * Il doit être importé après que tous les modèles ont été définis
 */

const User = require('./User');
const Client = require('./Client');
const Entreprise = require('./Entreprise');

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

module.exports = {
  User,
  Client,
  Entreprise
};