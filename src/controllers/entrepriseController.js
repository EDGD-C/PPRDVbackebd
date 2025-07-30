// Importer les modèles avec leurs associations
const { Entreprise } = require('../models/index');
const { Op } = require('@sequelize/core');

/**
 * Récupérer toutes les entreprises
 */
exports.getAllEntreprises = async () => {
  return Entreprise.findAll();
};

/**
 * Récupérer une entreprise par son ID
 */
exports.getEntrepriseById = async (id) => {
  return Entreprise.findByPk(id);
};

/**
 * Récupérer une entreprise par son UUID
 */
exports.getEntrepriseByUuid = async (uuid) => {
  return Entreprise.findByUuid(uuid);
};

/**
 * Récupérer une entreprise par son numéro SIRET
 */
exports.getEntrepriseBySiret = async (siret) => {
  return Entreprise.findBySiret(siret);
};

/**
 * Rechercher des entreprises par nom
 */
exports.searchEntreprisesByName = async (searchTerm) => {
  return Entreprise.findAll({
    where: {
      nom: {
        [Op.like]: `%${searchTerm}%`
      }
    }
  });
};

/**
 * Créer une nouvelle entreprise
 */
exports.createEntreprise = async (data) => {
  return Entreprise.create({
    nom: data.nom,
    description: data.description || null,
    siret: data.siret
  });
};

/**
 * Mettre à jour une entreprise
 */
exports.updateEntreprise = async (id, data) => {
  const entreprise = await Entreprise.findByPk(id);
  
  if (!entreprise) {
    return null;
  }
  
  // Mettre à jour uniquement les champs fournis
  if (data.nom !== undefined) entreprise.nom = data.nom;
  if (data.description !== undefined) entreprise.description = data.description;
  if (data.siret !== undefined) entreprise.siret = data.siret;
  
  await entreprise.save();
  return entreprise;
};

/**
 * Supprimer une entreprise
 */
exports.deleteEntreprise = async (id) => {
  const entreprise = await Entreprise.findByPk(id);
  
  if (!entreprise) {
    return false;
  }
  
  await entreprise.destroy();
  return true;
};