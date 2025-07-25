const User = require('../models/User');

// Middleware pour vérifier si l'utilisateur est actif
const checkActiveUser = async (request, reply) => {
  try {
    const userId = request.user.id;
    const user = await User.findByPk(userId);
    
    if (!user || !user.isActif) {
      return reply.code(403).send({ 
        error: 'Compte utilisateur désactivé' 
      });
    }
    
    // Ajouter les infos utilisateur complètes à la requête
    request.userDetails = user;
  } catch (err) {
    return reply.code(500).send({ 
      error: 'Erreur lors de la vérification du statut utilisateur' 
    });
  }
};

// Middleware pour vérifier si l'utilisateur est administrateur
const requireAdmin = async (request, reply) => {
  try {
    const userId = request.user.id;
    const user = await User.findByPk(userId);
    
    if (!user || !user.isActif) {
      return reply.code(403).send({ 
        error: 'Compte utilisateur désactivé' 
      });
    }
    
    if (user.role !== 'admin') {
      return reply.code(403).send({ 
        error: 'Accès autorisé aux administrateurs uniquement' 
      });
    }
    
    // Ajouter les infos utilisateur complètes à la requête
    request.userDetails = user;
  } catch (err) {
    return reply.code(500).send({ 
      error: 'Erreur lors de la vérification des permissions' 
    });
  }
};

// Middleware pour vérifier un rôle spécifique
const requireRole = (role) => {
  return async (request, reply) => {
    try {
      const userId = request.user.id;
      const user = await User.findByPk(userId);
      
      if (!user || !user.isActif) {
        return reply.code(403).send({ 
          error: 'Compte utilisateur désactivé' 
        });
      }
      
      if (user.role !== role) {
        return reply.code(403).send({ 
          error: `Accès autorisé au rôle ${role} uniquement` 
        });
      }
      
      request.userDetails = user;
    } catch (err) {
      return reply.code(500).send({ 
        error: 'Erreur lors de la vérification des permissions' 
      });
    }
  };
};

module.exports = {
  checkActiveUser,
  requireAdmin,
  requireRole,
}; 