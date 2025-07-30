// Import models with their associations
const { Client, Entreprise } = require('../models/index');
const { Op } = require('@sequelize/core');

/**
 * Get all clients
 */
exports.getAllClients = async (includeInactive = false) => {
  const where = includeInactive ? {} : { isActif: true };
  return Client.findAll({
    where,
    include: [{ model: Entreprise, attributes: ['uuid', 'nom', 'siret'] }]
  });
};

/**
 * Get a client by uuid
 */
exports.getClientByUuid = async (uuid) => {
  return Client.findByUuid(uuid, {
    include: [{ model: Entreprise, attributes: ['uuid', 'nom', 'siret'] }]
  });
};

/**
 * Get active clients
 */
exports.getActiveClients = async () => {
  return Client.findActiveClients();
};

/**
 * Get clients by enterprise
 */
exports.getClientsByEntreprise = async (entrepriseId) => {
  return Client.findByEntreprise(entrepriseId);
};

/**
 * Search clients by name
 */
exports.searchClientsByName = async (searchTerm) => {
  return Client.findAll({
    where: {
      nom: {
        [Op.like]: `%${searchTerm}%`
      }
    },
    include: [{ model: Entreprise, attributes: ['uuid', 'nom', 'siret'] }]
  });
};

/**
 * Create a new client
 */
exports.createClient = async (data) => {
  return Client.create({
    nom: data.nom,
    email: data.email,
    nomEntreprise: data.nomEntreprise || null,
    description: data.description || null,
    entrepriseId: data.enterpriseUuid || null,
    isActif: data.isActif !== undefined ? data.isActif : true
  });
};

/**
 * Update a client
 */
exports.updateClient = async (id, data) => {
  const client = await Client.findByPk(id);
  
  if (!client) {
    return null;
  }
  
  // Update only the fields provided
  if (data.nom !== undefined) client.nom = data.nom;
  if (data.email !== undefined) client.email = data.email;
  if (data.nomEntreprise !== undefined) client.nomEntreprise = data.nomEntreprise;
  if (data.description !== undefined) client.description = data.description;
  if (data.entrepriseId !== undefined) client.entrepriseId = data.entrepriseId;
  if (data.isActif !== undefined) client.isActif = data.isActif;
  
  await client.save();
  return client;
};

/**
 * Delete a client
 */
exports.deleteClient = async (id) => {
  const client = await Client.findByPk(id);
  
  if (!client) {
    return false;
  }
  
  await client.destroy();
  return true;
};

/**
 * Deactivate a client
 */
exports.deactivateClient = async (id) => {
  const client = await Client.findByPk(id);
  
  if (!client) {
    return null;
  }
  
  client.isActif = false;
  await client.save();
  return client;
};

/**
 * Activate a client
 */
exports.activateClient = async (id) => {
  const client = await Client.findByPk(id);
  
  if (!client) {
    return null;
  }
  
  client.isActif = true;
  await client.save();
  return client;
};