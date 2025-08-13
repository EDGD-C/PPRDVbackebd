// Import models with their associations
const { Client, Entreprise } = require("../models/index");
const { Op } = require("@sequelize/core");

/**
 * Get all clients
 */
exports.getAllClients = async () => {
  return Client.findAll({
    include: [{ model: Entreprise, attributes: ["uuid", "nom", "siret"] }],
  });
};

/**
 * Get a client by uuid
 */
exports.getClientByUuid = async (uuid) => {
  return Client.findByUuid(uuid, {
    include: [{ model: Entreprise, attributes: ["uuid", "nom", "siret"] }],
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
        [Op.like]: `%${searchTerm}%`,
      },
    },
    include: [{ model: Entreprise, attributes: ["uuid", "nom", "siret"] }],
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
    entrepriseId: data.entrepriseId || null,
    isActif: data.isActif !== undefined ? data.isActif : true,
  });
};

/**
 * Update a client
 */
exports.updateClient = async (uuid, data) => {
  const client = await Client.findByUuid(uuid);
  if (!client) {
    return null;
  }

  // Update only the fields provided
  if (data.nom !== undefined) client.nom = data.nom;
  if (data.email !== undefined) client.email = data.email;
  if (data.nomEntreprise !== undefined)
    client.nomEntreprise = data.nomEntreprise;
  if (data.description !== undefined) client.description = data.description;
  if (data.entrepriseId !== undefined) client.entrepriseId = data.entrepriseId;
  if (data.isActif !== undefined) client.isActif = data.isActif;

  await client.save();
  return client;
};

/**
 * Delete a client
 */
exports.deleteClient = async (uuid) => {
  // It's good practice to get the sequelize instance and models first
  const sequelize = require("../config/database");
  const Client = require("../models/Client"); // Assuming this is your model path
  const User = require("../models/User");

  // Find the records you need to work with *before* starting the transaction
  const client = await Client.findOne({ where: { uuid } });

  if (!client) {
    return false; // No client found, no action needed
  }

  // Find the associated user
  const user = await User.findByPk(client.userId);

  try {
    // Start the managed transaction.
    // Sequelize will automatically commit if the callback succeeds,
    // or rollback if it throws an error.
    await sequelize.transaction(async (t) => {
      // 1. Delete the client within the transaction
      await client.destroy({ transaction: t });

      // 2. Delete the associated user (if they exist) within the same transaction
      if (user) {
        await user.destroy({ transaction: t });
      }
    });
    return true;
  } catch (error) {
    console.error("Transaction failed and was rolled back:", error);
    throw error;
  }
};

/**
 * Deactivate a client
 */
exports.deactivateClient = async (uuid) => {
  const client = await Client.findByUuid(uuid);

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
exports.activateClient = async (uuid) => {
  const client = await Client.findByUuid(uuid);

  if (!client) {
    return null;
  }

  client.isActif = true;
  await client.save();
  return client;
};
