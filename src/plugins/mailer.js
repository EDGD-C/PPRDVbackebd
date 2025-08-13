const fp = require('fastify-plugin');
const fs = require('fs/promises');
const path = require('path');
const Handlebars = require('handlebars');

module.exports = fp(async function (fastify, opts) {
  // Register fastify-mailer with configuration from environment variables
  await fastify.register(require('fastify-mailer'), {
    defaults: {
      from: process.env.MAIL_FROM || 'actorbig4@gmail.com'
    },
    transport: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  });

  // Pre-compile the templates on startup for better performance
  const templates = {};
  try {
    const htmlTemplateContent = await fs.readFile(
      path.join(__dirname, '..', 'templates', 'welcome-email.html.hbs'),
      'utf8'
    );
    const textTemplateContent = await fs.readFile(
      path.join(__dirname, '..', 'templates', 'welcome-email.text.hbs'),
      'utf8'
    );

    templates.html = Handlebars.compile(htmlTemplateContent);
    templates.text = Handlebars.compile(textTemplateContent);
    fastify.log.info('Email templates compiled successfully.');
  } catch (error) {
    fastify.log.error('Failed to compile email templates:', error);
    fastify.log.warn('Email functionality will be disabled due to missing templates.');
    // Don't throw error to allow server to start, but templates will be undefined
  }

  // Helper function to send client welcome email
  fastify.decorate('sendClientWelcomeEmail', async function(clientData, plainPassword) {
    try {
      if (!templates.html || !templates.text) {
        fastify.log.warn('Email templates not available, skipping welcome email for:', clientData.email);
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
        html: templates.html(templateData),
        text: templates.text(templateData)
      };

      return new Promise((resolve, reject) => {
        fastify.mailer.sendMail(mailOptions, (error, info) => {
          if (error) {
            fastify.log.error('Email sending error:', error);
            reject(error);
          } else {
            fastify.log.info('Welcome email sent successfully to:', clientData.email);
            resolve(info);
          }
        });
      });
    } catch (error) {
      fastify.log.error('Error in sendClientWelcomeEmail:', error);
      // Return a fallback response instead of throwing
      return { error: error.message, skipped: true };
    }
  });
});