# PPRDV - API de Gestion des Rendez-vous

Une API REST complète construite avec Fastify pour la gestion des rendez-vous, des entreprises et des clients.

## 🚀 Fonctionnalités

- **Authentification JWT** avec sessions
- **Gestion des utilisateurs** (administrateurs)
- **Gestion des entreprises** avec SIRET
- **Gestion des clients** liés aux entreprises
- **API REST** documentée avec Swagger
- **Base de données MySQL** avec Sequelize ORM
- **Sécurité** avec validation des entrées et contrôle d'accès

## 📋 Prérequis

- Node.js (v18+)
- MySQL (v8.0+)
- npm ou yarn

## 🛠️ Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd pprdv
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet :
   ```env
   # Configuration de la base de données
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=pprdv

   # Configuration JWT
   JWT_SECRET=votre_secret_jwt_tres_long_et_complexe

   # Configuration des sessions
   SESSION_SECRET=votre_secret_session_tres_long_et_complexe

   # Configuration du serveur
   PORT=3000
   NODE_ENV=development
   ```

4. **Initialiser la base de données**
   ```bash
   node init-db.js
   ```

5. **Démarrer le serveur**
   ```bash
   node src/server.js
   ```

## 📚 Structure du Projet

```
pprdv/
├── src/
│   ├── config/
│   │   └── database.js          # Configuration Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Contrôleur d'authentification
│   │   ├── userController.js    # Contrôleur des utilisateurs
│   │   ├── entrepriseController.js # Contrôleur des entreprises
│   │   └── clientController.js  # Contrôleur des clients
│   ├── middleware/
│   │   └── roleMiddleware.js    # Middleware de contrôle d'accès
│   ├── models/
│   │   ├── User.js             # Modèle utilisateur
│   │   ├── Entreprise.js       # Modèle entreprise
│   │   ├── Client.js           # Modèle client
│   │   ├── associations.js     # Associations entre modèles
│   │   └── index.js            # Point d'entrée des modèles
│   ├── plugins/
│   │   ├── auth.js             # Plugin d'authentification JWT
│   │   ├── cors.js             # Plugin CORS
│   │   ├── database.js         # Plugin de base de données
│   │   ├── session.js          # Plugin de gestion des sessions
│   │   └── swagger.js          # Plugin de documentation API
│   ├── routes/
│   │   ├── auth.js             # Routes d'authentification
│   │   ├── users.js            # Routes des utilisateurs
│   │   ├── entreprises.js      # Routes des entreprises
│   │   └── clients.js          # Routes des clients
│   └── server.js               # Point d'entrée de l'application
├── migrations/                 # Migrations de base de données
├── init-db.js                 # Script d'initialisation
├── package.json
└── README.md
```

## 🔐 Authentification

### Compte administrateur par défaut
- **Email**: admin@example.com
- **Mot de passe**: admin123

### Endpoints d'authentification
- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion (JWT + session)
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/session` - Informations de session

## 📖 API Documentation

Une fois le serveur démarré, la documentation Swagger est disponible à :
- **URL**: http://localhost:3000/documentation
- **Interface**: Interface interactive pour tester les API

## 🗄️ Modèles de Données

### User (Administrateurs)
- `id` - Identifiant unique
- `uuid` - UUID unique
- `username` - Nom d'utilisateur
- `email` - Adresse email
- `password` - Mot de passe hashé
- `role` - Rôle (user/admin)
- `isActif` - Statut actif/inactif

### Entreprise
- `id` - Identifiant unique
- `uuid` - UUID unique
- `nom` - Nom de l'entreprise
- `description` - Description
- `siret` - Numéro SIRET (unique)

### Client
- `id` - Identifiant unique
- `uuid` - UUID unique
- `nom` - Nom du client
- `email` - Adresse email (unique)
- `nomEntreprise` - Nom de l'entreprise du client
- `description` - Description
- `entrepriseId` - Référence vers l'entreprise
- `isActif` - Statut actif/inactif

## 🔧 Scripts Disponibles

- `node init-db.js` - Initialise la base de données avec les données de démonstration
- `node src/server.js` - Démarre le serveur de développement

## 🚨 Sécurité

- Mots de passe hashés avec bcrypt
- JWT pour l'authentification API
- Sessions pour la gestion des connexions
- Validation des entrées avec Fastify
- Contrôle d'accès basé sur les rôles
- CORS configuré

## 📝 Notes de Développement

- Les migrations Umzug sont disponibles mais l'approche `sequelize.sync()` est utilisée pour simplifier
- L'application utilise les sessions pour une meilleure expérience utilisateur
- Tous les endpoints sont documentés avec Swagger
- La structure modulaire facilite l'ajout de nouvelles fonctionnalités

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.