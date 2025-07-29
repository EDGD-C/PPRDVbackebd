const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return User.create({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    role: data.role || 'user', // Par défaut 'user'
    isActif: true, // Nouveau compte activé par défaut
  });
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Identifiants invalides');
  }
  
  // Vérifier si le compte est actif
  if (!user.isActif) {
    throw new Error('Compte désactivé');
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Identifiants invalides');
  }
  
  // Préparer les données utilisateur (sans le mot de passe)
  const userData = {
    id: user.id,
    uuid: user.uuid,
    username: user.username,
    email: user.email,
    role: user.role,
    isActif: user.isActif,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  
  return { user: userData };
};

/**
 * Prépare les données utilisateur pour la session et le token JWT
 */
exports.prepareUserData = (user) => {
  return {
    id: user.id,
    uuid: user.uuid,
    username: user.username,
    email: user.email,
    role: user.role,
    isActif: user.isActif
  };
};

/**
 * Vérifie si l'utilisateur est connecté via la session
 */
exports.checkSessionAuth = (request) => {
  return request.session && request.session.get('user');
};

/**
 * Déconnecte l'utilisateur en détruisant sa session
 */
exports.logout = async (request) => {
  return new Promise((resolve, reject) => {
    if (request.session) {
      request.session.destroy(err => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    } else {
      resolve(false);
    }
  });
}; 