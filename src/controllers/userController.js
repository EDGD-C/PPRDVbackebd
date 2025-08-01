const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return User.create({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    role: data.role || 'user',
    isActif: data.isActif !== undefined ? data.isActif : true,
  });
};

exports.getUserById = async (id) => {
  return User.findByPk(id, { 
    attributes: { exclude: ['password'] } 
  });
};

exports.getUserByUuid = async (uuid) => {
  return User.findByUuid(uuid, { 
    attributes: { exclude: ['password'] } 
  });
};

exports.getAllUsers = async (includeInactive = false) => {
  const whereClause = includeInactive ? {} : { isActif: true };
  return User.findAll({ 
    where: whereClause,
    attributes: { exclude: ['password'] } 
  });
};

exports.getActiveUsers = async () => {
  return User.findActiveUsers();
};

exports.getAdmins = async () => {
  return User.findAdmins();
};

exports.updateUser = async (uuid, data) => {
  const user = await User.findByUuid(uuid);
  if (!user) return null;
  
  // Hash the new password if provided
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  
  await user.update(data);
  return user;
};

exports.updateUserByUuid = async (uuid, data) => {
  const user = await User.findByUuid(uuid);
  if (!user) return null;
  
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  
  await user.update(data);
  return user;
};

exports.deleteUser = async (uuid) => {
  const user = await User.findByUuid(uuid);
  if (!user) return null;
  await user.destroy();
  return true;
};

exports.deactivateUser = async (uuid) => {
  const user = await User.findByUuid(uuid);
  if (!user) return null;
  await user.update({ isActif: false });
  return user;
};

exports.activateUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update({ isActif: true });
  return user;
};

exports.promoteToAdmin = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update({ role: 'admin' });
  return user;
};

exports.demoteFromAdmin = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update({ role: 'user' });
  return user;
}; 