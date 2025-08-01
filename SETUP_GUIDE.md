# Guide de Configuration Rapide - PPRDV avec Authentification Client

Ce guide vous accompagne étape par étape pour configurer et tester l'authentification client.

## 🚀 Configuration Rapide

### 1. Prérequis
- Node.js v18+
- MySQL v8.0+
- Git

### 2. Installation

```bash
# Cloner le projet
git clone <repository-url>
cd pprdv

# Installer les dépendances
npm install
```

### 3. Configuration de la base de données

```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE pprdv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 4. Configuration des variables d'environnement

Créez un fichier `.env` à la racine :

```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=pprdv

# JWT et Sessions
JWT_SECRET=votre_secret_jwt_tres_long_et_complexe_123456789
SESSION_SECRET=votre_secret_session_tres_long_et_complexe_123456789

# Serveur
PORT=3000
NODE_ENV=development
```

### 5. Initialisation de la base de données

```bash
# Initialiser avec les données de démonstration
npm run init-db
```

**Comptes créés automatiquement :**
- **Admin** : `admin@example.com` / `admin123`
- **Client 1** : `client1@example.com` / `client123`
- **Client 2** : `client2@example.com` / `client123`

### 6. Démarrer le serveur

```bash
# Démarrer avec vérification automatique
npm start
```

Le serveur sera accessible sur : http://localhost:3000

## 🧪 Tests d'authentification client

### Test automatique complet

```bash
# Lancer tous les tests d'authentification client
npm run test:client-auth
```

### Test manuel avec curl

```bash
# 1. Connexion client
curl -X POST http://localhost:3000/api/client/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@example.com","password":"client123"}'

# 2. Changement de mot de passe (utilisez le token de la réponse précédente)
curl -X POST http://localhost:3000/api/client/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -d '{"currentPassword":"client123","newPassword":"nouveauMotDePasse123"}'

# 3. Connexion avec le nouveau mot de passe
curl -X POST http://localhost:3000/api/client/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@example.com","password":"nouveauMotDePasse123"}'
```

### Test avec Postman

1. **Connexion client** : `POST http://localhost:3000/api/client/login`
   ```json
   {
     "email": "client1@example.com",
     "password": "client123"
   }
   ```

2. **Changement de mot de passe** : `POST http://localhost:3000/api/client/change-password`
   - Headers : `Authorization: Bearer VOTRE_TOKEN`
   ```json
   {
     "currentPassword": "client123",
     "newPassword": "nouveauMotDePasse123"
   }
   ```

## 📚 Documentation API

- **Swagger UI** : http://localhost:3000/documentation
- **Section Client Authentication** : Disponible dans la documentation

## 🔧 Endpoints principaux

### Authentification Client
- `POST /api/client/login` - Connexion client
- `POST /api/client/change-password` - Changement de mot de passe
- `POST /api/client/logout` - Déconnexion
- `GET /api/client/session` - Informations de session

### Administration
- `POST /api/admin/client/reset-password/:clientId` - Réinitialisation mot de passe

## 🚨 Dépannage

### Erreur de connexion à la base de données
```bash
# Vérifier que MySQL est démarré
# Vérifier les paramètres dans .env
# Vérifier que la base de données existe
mysql -u root -p -e "SHOW DATABASES;"
```

### Erreur de port déjà utilisé
```bash
# Changer le port dans .env
PORT=3001
```

### Erreur de modules
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur d'authentification
```bash
# Vérifier que la base de données est initialisée
npm run init-db
```

## 📋 Checklist de vérification

- [ ] MySQL démarré et accessible
- [ ] Base de données `pprdv` créée
- [ ] Fichier `.env` configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Base de données initialisée (`npm run init-db`)
- [ ] Serveur démarré (`npm start`)
- [ ] Tests d'authentification passés (`npm run test:client-auth`)

## 🎯 Workflow client typique

1. **Première connexion** : Client utilise email + mot de passe par défaut (`client123`)
2. **Changement obligatoire** : Le système détecte `isFirstLogin: true`
3. **Nouveau mot de passe** : Client change son mot de passe
4. **Connexions suivantes** : Client utilise son nouveau mot de passe

## 🔒 Sécurité

- **Mot de passe par défaut** : `client123` (doit être changé)
- **Hashage** : bcrypt avec salt rounds = 10
- **Longueur minimum** : 6 caractères
- **Sessions séparées** : Clients et admins ont des sessions distinctes

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur
2. Consultez la documentation Swagger
3. Exécutez les tests automatiques
4. Vérifiez la configuration de la base de données

---

**Note** : Ce guide suppose que vous utilisez Windows avec Git Bash. Les commandes peuvent varier légèrement sur d'autres systèmes. 