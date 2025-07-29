const { DataTypes, sql } = require('@sequelize/core');

module.exports = {
  up: async (queryInterface) => {
    console.log('🚀 Exécution de la migration combinée...');
    
    // Créer la table users avec toutes les colonnes
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: sql.uuidV4,
        allowNull: false,
        unique: true
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false
      },
      isActif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
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
    
    // Ajouter les index
    await queryInterface.addIndex('users', ['uuid'], {
      name: 'users_uuid_index',
      unique: true
    });
    
    await queryInterface.addIndex('users', ['role'], {
      name: 'users_role_index'
    });
    
    console.log('✅ Table users créée avec succès avec toutes les colonnes et index');
  },
  
  down: async (queryInterface) => {
    console.log('🔄 Rollback de la migration combinée...');
    
    // Supprimer les index
    await queryInterface.removeIndex('users', 'users_uuid_index');
    await queryInterface.removeIndex('users', 'users_role_index');
    
    // Supprimer la table
    await queryInterface.dropTable('users');
    
    console.log('✅ Table users supprimée avec succès');
  }
};
