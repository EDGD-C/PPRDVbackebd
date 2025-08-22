/**
 * Point d'entrée pour les modèles
 * Exporte tous les modèles avec leurs associations configurées
 */

// Importer les modèles de base
const User = require('./User');

// Importer les associations qui configurent les relations entre modèles
const { Entreprise, Client, PasswordReset } = require('./associations');

// Exporter tous les modèles
module.exports = {
  User,
  Entreprise,
  Client,
  // TODO: Add back when tables are created
  // RequestLimit,
  PasswordReset
};