const { DataTypes, sql } = require('@sequelize/core');

module.exports = {
  up: async (queryInterface) => {
    // Ajouter la colonne UUID
    await queryInterface.addColumn('users', 'uuid', {
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
      allowNull: false,
      unique: true
    });

    // Ajouter la colonne role
    await queryInterface.addColumn('users', 'role', {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      allowNull: false
    });

    // Ajouter la colonne isActif
    await queryInterface.addColumn('users', 'isActif', {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    // Ajouter des index pour de meilleures performances
    await queryInterface.addIndex('users', ['uuid'], {
      name: 'users_uuid_index',
      unique: true
    });

    await queryInterface.addIndex('users', ['role'], {
      name: 'users_role_index'
    });
  },

  down: async (queryInterface) => {
    // Supprimer les index
    await queryInterface.removeIndex('users', 'users_uuid_index');
    await queryInterface.removeIndex('users', 'users_role_index');
    
    // Supprimer les colonnes (dans l'ordre inverse)
    await queryInterface.removeColumn('users', 'isActif');
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.removeColumn('users', 'uuid');
  }
}; 