const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return User.create({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    role: data.role || 'user', // default user
    isActif: true, // new account activated by default
  });
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check if the account is active
  if (!user.isActif) {
    throw new Error('Account deactivated');
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Invalid credentials');
  }
  
  // Prepare user data (without password)
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
 * Prepare user data for session and JWT token
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
 * Check if the user is connected via the session
 */
exports.checkSessionAuth = (request) => {
  return request.session && request.session.get('user');
};

/**
 * Logout the user by destroying their session
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