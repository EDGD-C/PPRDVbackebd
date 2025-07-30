const sequelize = require('./src/config/database');
const bcrypt = require('bcryptjs');

// Importer tous les modèles avec leurs associations
const { User, Entreprise, Client } = require('./src/models/index');

// Fonction pour initialiser la base de données
async function initDatabase() {
  try {
    // Vérifier la connexion à la base de données
    console.log('Vérification de la connexion à la base de données...');
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');

    // Synchroniser les modèles avec la base de données (force: true pour recréer les tables)
    console.log('Synchronisation des modèles...');
    await sequelize.sync({ force: true });
    console.log('Modèles synchronisés avec succès.');

    // Créer un administrateur par défaut
    console.log('Création de l\'administrateur par défaut...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActif: true
    });
    
    console.log('Administrateur par défaut créé avec succès.');
    console.log('Email: admin@example.com');
    console.log('Mot de passe: admin123');

    // Créer des entreprises de démonstration
    console.log('Création d\'entreprises de démonstration...');
    
    const entreprises = await Entreprise.bulkCreate([
      {
        nom: 'Entreprise A',
        description: 'Une entreprise de démonstration',
        siret: '12345678901234'
      },
      {
        nom: 'Entreprise B',
        description: 'Une autre entreprise de démonstration',
        siret: '98765432109876'
      }
    ]);
    
    console.log('Entreprises de démonstration créées avec succès.');

    // Créer des clients de démonstration
    console.log('Création de clients de démonstration...');
    
    await Client.bulkCreate([
      {
        nom: 'Client 1',
        email: 'client1@example.com',
        nomEntreprise: 'Entreprise Client 1',
        description: 'Un client de démonstration',
        entrepriseId: entreprises[0].id,
        isActif: true
      },
      {
        nom: 'Client 2',
        email: 'client2@example.com',
        nomEntreprise: 'Entreprise Client 2',
        description: 'Un autre client de démonstration',
        entrepriseId: entreprises[1].id,
        isActif: true
      }
    ]);
    
    console.log('Clients de démonstration créés avec succès.');
    console.log('Initialisation de la base de données terminée avec succès.');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation
initDatabase(); 