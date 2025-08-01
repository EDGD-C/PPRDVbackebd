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
    
    // Hash du mot de passe par défaut pour les clients
    const defaultClientPassword = await bcrypt.hash('client123', 10);
    
    // Créer les utilisateurs clients
    const clientUsers = await User.bulkCreate([
      {
        username: 'client1@example.com',
        email: 'client1@example.com',
        password: defaultClientPassword,
        role: 'client',
        isActif: true,
        isFirstLogin: true
      },
      {
        username: 'client2@example.com',
        email: 'client2@example.com',
        password: defaultClientPassword,
        role: 'client',
        isActif: true,
        isFirstLogin: true
      }
    ]);
    
    // Créer les profils clients
    await Client.bulkCreate([
      {
        userId: clientUsers[0].id,
        nom: 'Client 1',
        nomEntreprise: 'Entreprise Client 1',
        entrepriseId: entreprises[0].id,
        description: 'Un client de démonstration'
      },
      {
        userId: clientUsers[1].id,
        nom: 'Client 2',
        nomEntreprise: 'Entreprise Client 2',
        entrepriseId: entreprises[1].id,
        description: 'Un autre client de démonstration'
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