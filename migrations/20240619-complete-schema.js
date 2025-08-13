const { DataTypes, sql } = require('@sequelize/core');

/**
 * Migration complète pour créer toutes les tables de l'application
 * - Table users (administrateurs)
 * - Table entreprises
 * - Table clients
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Création de la table users (administrateurs)
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: sql.uuidV4,
        allowNull: false,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'client'),
        defaultValue: 'client',
        allowNull: false,
      },
      isFirstLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      isActif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Création de la table entreprises
    await queryInterface.createTable('entreprises', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: sql.uuidV4,
        allowNull: false,
        unique: true,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      siret: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Création de la table clients
    await queryInterface.createTable('clients', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        // No defaultValue - will be set manually to match User UUID
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nomEntreprise: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      entrepriseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'entreprises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      setLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isActif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les tables dans l'ordre inverse pour éviter les problèmes de clés étrangères
    await queryInterface.dropTable('clients');
    await queryInterface.dropTable('entreprises');
    await queryInterface.dropTable('users');
  }
}; 