/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('password_resets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User requesting password reset'
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Unique token for password reset'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Token expiration time'
      },
      isUsed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether the token has been used'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'IP address of the reset request'
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent of the reset request'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('password_resets', ['token'], {
      name: 'idx_password_resets_token'
    });

    await queryInterface.addIndex('password_resets', ['userId'], {
      name: 'idx_password_resets_user_id'
    });

    await queryInterface.addIndex('password_resets', ['expiresAt'], {
      name: 'idx_password_resets_expires_at'
    });

    await queryInterface.addIndex('password_resets', ['userId', 'isUsed', 'expiresAt'], {
      name: 'idx_password_resets_lookup'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('password_resets');
  }
};
