/**
 * Ce fichier définit toutes les associations entre les modèles
 * Il doit être importé après que tous les modèles ont été définis
 */

const Client = require('./Client');
const Entreprise = require('./Entreprise');

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
  Client,
  Entreprise
};