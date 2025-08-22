const fp = require('fastify-plugin');
const fs = require('fs/promises');
const path = require('path');
const Handlebars = require('handlebars');

module.exports = fp(async function (fastify, opts) {
  // Check if SMTP credentials are configured
  const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
  
  if (!smtpConfigured) {
    fastify.log.warn('⚠️  SMTP credentials not configured. Email functionality will be disabled.');
    fastify.log.warn('   To enable emails, configure SMTP_USER and SMTP_PASS in your .env file');
  }

  // Register fastify-mailer with configuration from environment variables
  await fastify.register(require('fastify-mailer'), {
    defaults: {
      from: process.env.MAIL_FROM || 'actorbig4@gmail.com'
    },
    transport: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      requireTLS: true, // Force TLS
      auth: smtpConfigured ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    }
  });

  // Pre-compile the templates on startup for better performance
  const templates = {
    welcome: {},
    passwordReset: {}
  };
  
  try {
    // Welcome email templates
    const welcomeHtmlContent = await fs.readFile(
      path.join(__dirname, '..', 'templates', 'welcome-email.html.hbs'),
      'utf8'
    );
    const welcomeTextContent = await fs.readFile(
      path.join(__dirname, '..', 'templates', 'welcome-email.text.hbs'),
      'utf8'
    );

    templates.welcome.html = Handlebars.compile(welcomeHtmlContent);
    templates.welcome.text = Handlebars.compile(welcomeTextContent);
    
    // Password reset email templates
    const passwordResetHtmlContent = await fs.readFile(
      path.join(__dirname, '..', 'templates', 'password-reset.html.hbs'),
      'utf8'
    );
    const passwordResetTextContent = await fs.readFile(
      path.join(__dirname, '..', 'templates', 'password-reset.text.hbs'),
      'utf8'
    );

    templates.passwordReset.html = Handlebars.compile(passwordResetHtmlContent);
    templates.passwordReset.text = Handlebars.compile(passwordResetTextContent);
    
    fastify.log.info('Email templates compiled successfully.');
  } catch (error) {
    fastify.log.error('Failed to compile email templates:', error);
    fastify.log.warn('Email functionality will be disabled due to missing templates.');
    // Don't throw error to allow server to start, but templates will be undefined
  }

  // Helper function to send client welcome email
  fastify.decorate('sendClientWelcomeEmail', async function(clientData, plainPassword) {
    try {
      // Check if SMTP is configured
      if (!smtpConfigured) {
        fastify.log.warn('📧 SMTP not configured, skipping welcome email for:', clientData.email);
        fastify.log.info('💡 Client credentials - Email:', clientData.email, 'Password:', plainPassword);
        return { skipped: true, reason: 'SMTP not configured', credentials: { email: clientData.email, password: plainPassword } };
      }

      if (!templates.welcome.html || !templates.welcome.text) {
        fastify.log.warn('Welcome email templates not available, skipping welcome email for:', clientData.email);
        return { skipped: true, reason: 'Templates not loaded' };
      }

      const templateData = {
        client: clientData,
        plainPassword: plainPassword,
        appUrl: process.env.APP_URL || 'http://localhost:3000'
      };

      const mailOptions = {
        to: clientData.email,
        subject: 'Bienvenue sur PPRDV - Vos identifiants de connexion',
        html: templates.welcome.html(templateData),
        text: templates.welcome.text(templateData)
      };

      return new Promise((resolve, reject) => {
        fastify.mailer.sendMail(mailOptions, (error, info) => {
          if (error) {
            fastify.log.error('📧 Email sending error:', error.message);
            fastify.log.warn('💡 Email failed for:', clientData.email, '- Password:', plainPassword);
            // Don't reject, just return error info so client creation continues
            resolve({ error: error.message, skipped: true, credentials: { email: clientData.email, password: plainPassword } });
          } else {
            fastify.log.info('✅ Welcome email sent successfully to:', clientData.email);
            resolve(info);
          }
        });
      });
    } catch (error) {
      fastify.log.error('Error in sendClientWelcomeEmail:', error);
      // Return a fallback response instead of throwing
      return { error: error.message, skipped: true, credentials: { email: clientData.email, password: plainPassword } };
    }
  });

  // Helper function to send password reset email
  fastify.decorate('sendPasswordResetEmail', async function(resetData) {
    try {
      // Check if SMTP is configured
      if (!smtpConfigured) {
        fastify.log.warn('📧 SMTP not configured, skipping password reset email for:', resetData.email);
        fastify.log.info('💡 Password reset token for', resetData.email, ':', resetData.resetToken);
        return { skipped: true, reason: 'SMTP not configured', resetToken: resetData.resetToken };
      }

      if (!templates.passwordReset.html || !templates.passwordReset.text) {
        fastify.log.warn('Password reset email templates not available, skipping email for:', resetData.email);
        return { skipped: true, reason: 'Templates not loaded' };
      }

      const appUrl = 'https://p07b47d8-3000.uks1.devtunnels.ms/';
      const templateData = {
        email: resetData.email,
        username: resetData.username,
        resetUrl: `${appUrl}/password-reset?token=${resetData.resetToken}`,
        resetToken: resetData.resetToken,
        expiresAt: resetData.expiresAt,
        appUrl: appUrl
      };

      const mailOptions = {
        to: resetData.email,
        subject: 'PPRDV - Réinitialisation de mot de passe',
        html: templates.passwordReset.html(templateData),
        text: templates.passwordReset.text(templateData)
      };

      return new Promise((resolve, reject) => {
        fastify.mailer.sendMail(mailOptions, (error, info) => {
          if (error) {
            fastify.log.error('📧 Password reset email sending error:', error.message);
            fastify.log.warn('💡 Reset token for', resetData.email, ':', resetData.resetToken);
            // Don't reject, just return error info
            resolve({ error: error.message, skipped: true, resetToken: resetData.resetToken });
          } else {
            fastify.log.info('✅ Password reset email sent successfully to:', resetData.email);
            resolve(info);
          }
        });
      });
    } catch (error) {
      fastify.log.error('Error in sendPasswordResetEmail:', error);
      // Return a fallback response instead of throwing
      return { error: error.message, skipped: true, resetToken: resetData.resetToken };
    }
  });
});