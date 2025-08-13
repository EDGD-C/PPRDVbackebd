const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthController {
  // Default password for new clients
  static DEFAULT_CLIENT_PASSWORD = 'client123';

  // Unified login for both admin and client
  static async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActif) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  // Register new admin (admin only function)
  static async registerAdmin({ username, email, password, currentAdminId }) {
    if (!username || !email || !password) {
      throw new Error('Username, email and password are required');
    }

    // Validate password
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if current user is admin
    if (currentAdminId) {
      const currentAdmin = await User.findByPk(currentAdminId);
      if (!currentAdmin || !currentAdmin.isAdmin()) {
        throw new Error('Admin privileges required');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      isActif: true,
      isFirstLogin: false // Admins don't need to change password on first login
    });

    return admin;
  }

  // Create new client (admin only function)
  static async createClient({ nom, email, nomEntreprise, entrepriseId, description, adminId, fastifyInstance }) {
    if (!nom || !email) {
      throw new Error('Name and email are required');
    }

    // Check if admin is authorized
    if (adminId) {
      const admin = await User.findByPk(adminId);
      if (!admin || !admin.isAdmin()) {
        throw new Error('Admin privileges required');
      }
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash(this.DEFAULT_CLIENT_PASSWORD, 10);

    // Create client user first
    const clientUser = await User.create({
      username: email, // Use email as username for clients
      email,
      password: hashedPassword,
      role: 'client',
      isActif: true,
      isFirstLogin: true
    });

    // Create client profile
    const Client = require('../models/Client');
    const clientProfile = await Client.create({
      userId: clientUser.id,
      nom,
      nomEntreprise,
      entrepriseId,
      description
    });

    // Send welcome email with credentials
    if (fastifyInstance) {
      try {
        const clientData = {
          nom: nom,
          email: email,
          nomEntreprise: nomEntreprise
        };
        
        await fastifyInstance.sendClientWelcomeEmail(clientData, this.DEFAULT_CLIENT_PASSWORD);
        console.log('✅ Welcome email sent to:', email);
      } catch (emailError) {
        console.error('⚠️ Warning: Failed to send welcome email:', emailError);
        // Don't fail the client creation if email fails
      }
    }

    // Return user with client profile
    return clientUser;
  }

  // Change password (works for both admin and client)
  static async changePassword({ userId, currentPassword, newPassword }) {
    if (!userId || !currentPassword || !newPassword) {
      throw new Error('User ID, current password, and new password are required');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is active
    if (!user.isActif) {
      throw new Error('Account is deactivated');
    }

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password and set isFirstLogin to false for clients
    const updateData = {
      password: hashedNewPassword
    };

    // Only set isFirstLogin to false for clients
    if (user.isClient()) {
      updateData.isFirstLogin = false;
    }

    await user.update(updateData);

    return user;
  }

  // Reset client password to default (admin function)
  static async resetClientPassword({ clientId, adminId }) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    // Check if admin is authorized
    if (adminId) {
      const admin = await User.findByPk(adminId);
      if (!admin || !admin.isAdmin()) {
        throw new Error('Admin privileges required');
      }
    }

    // Find client
    const client = await User.findByPk(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    if (!client.isClient()) {
      throw new Error('User is not a client');
    }

    // Hash default password
    const hashedDefaultPassword = await bcrypt.hash(this.DEFAULT_CLIENT_PASSWORD, 10);

    // Update password and set isFirstLogin to true
    await client.update({
      password: hashedDefaultPassword,
      isFirstLogin: true
    });

    return client;
  }

  // Prepare user data for JWT (without sensitive information)
  static async prepareUserData(user) {
    const baseData = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      isActif: user.isActif,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add role-specific data
    if (user.isAdmin()) {
      return {
        ...baseData,
        username: user.username
      };
    } else if (user.isClient()) {
      // Load client profile data
      const Client = require('../models/Client');
      const clientProfile = await Client.findOne({ where: { userId: user.id } });
      
      return {
        ...baseData,
        username: user.username,
        isFirstLogin: user.isFirstLogin,
        nom: clientProfile?.nom || null,
        nomEntreprise: clientProfile?.nomEntreprise || null,
        entrepriseId: clientProfile?.entrepriseId || null,
        description: clientProfile?.description || null
      };
    }

    return baseData;
  }

  // Check if user needs to change password
  static async needsPasswordChange(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.isClient() && user.isFirstLogin;
  }

  // Get user profile
  static async getUserProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Update user profile
  static async updateUserProfile({ userId, updateData }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive fields from update
    const { password, role, isActif, ...safeUpdateData } = updateData;

    await user.update(safeUpdateData);
    return user;
  }

  // Check if the user is connected via the session
  static checkSessionAuth(request) {
    return request.session && request.session.get('user');
  }

  // Logout the user by destroying their session
  static async logout(request) {
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
  }
}

module.exports = AuthController; 