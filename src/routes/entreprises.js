const entrepriseController = require("../controllers/entrepriseController");

module.exports = async function (fastify, opts) {
  // Schémas communs
  const entrepriseSchema = {
    type: "object",
    properties: {
      uuid: { type: "string", format: "uuid" },
      nom: { type: "string" },
      description: { type: "string" },
      siret: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  };

  const errorSchema = {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  };

  const successSchema = {
    type: "object",
    properties: {
      message: { type: "string" },
    },
  };

  // Toutes les routes nécessitent une authentification
  fastify.addHook("onRequest", fastify.authenticate);

  // Routes admin uniquement
  fastify.register(async function (fastify) {
    fastify.addHook("onRequest", fastify.requireAdmin);

    // Obtenir toutes les entreprises
    fastify.get(
      "/",
      {
        schema: {
          tags: ["Entreprises"],
          summary: "Liste des entreprises",
          description: "Obtenir la liste de toutes les entreprises",
          security: [{ Bearer: [] }],
          response: {
            200: {
              description: "Liste des entreprises",
              type: "array",
              items: entrepriseSchema,
            },
            401: {
              description: "Non autorisé",
              ...errorSchema,
            },
            403: {
              description: "Accès interdit - Admin requis",
              ...errorSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const entreprises = await entrepriseController.getAllEntreprises();
        reply.send(entreprises);
      }
    );

    // Obtenir une entreprise par ID
    fastify.get(
      "/:id",
      {
        schema: {
          tags: ["Entreprises"],
          summary: "Entreprise par ID",
          description: "Obtenir une entreprise spécifique par son ID",
          security: [{ Bearer: [] }],
          params: {
            type: "object",
            properties: {
              id: { type: "integer", description: "ID de l'entreprise" },
            },
            required: ["id"],
          },
          response: {
            200: {
              description: "Entreprise trouvée",
              ...entrepriseSchema,
            },
            404: {
              description: "Entreprise non trouvée",
              ...errorSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const entreprise = await entrepriseController.getEntrepriseById(
          request.params.id
        );
        if (!entreprise)
          return reply.code(404).send({ error: "Entreprise non trouvée" });
        reply.send(entreprise);
      }
    );

    // Obtenir une entreprise par UUID
    fastify.get(
      "/uuid/:uuid",
      {
        schema: {
          tags: ["Entreprises"],
          summary: "Entreprise par UUID",
          description: "Obtenir une entreprise spécifique par son UUID",
          security: [{ Bearer: [] }],
          params: {
            type: "object",
            properties: {
              uuid: {
                type: "string",
                format: "uuid",
                description: "UUID de l'entreprise",
              },
            },
            required: ["uuid"],
          },
          response: {
            200: {
              description: "Entreprise trouvée",
              ...entrepriseSchema,
            },
            404: {
              description: "Entreprise non trouvée",
              ...errorSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const entreprise = await entrepriseController.getEntrepriseByUuid(
          request.params.uuid
        );
        if (!entreprise)
          return reply.code(404).send({ error: "Entreprise non trouvée" });
        reply.send(entreprise);
      }
    );

    // Obtenir une entreprise par SIRET
    fastify.get(
      "/siret/:siret",
      {
        schema: {
          tags: ["Entreprises"],
          summary: "Entreprise par SIRET",
          description: "Obtenir une entreprise spécifique par son numéro SIRET",
          security: [{ Bearer: [] }],
          params: {
            type: "object",
            properties: {
              siret: {
                type: "string",
                description: "Numéro SIRET de l'entreprise",
              },
            },
            required: ["siret"],
          },
          response: {
            200: {
              description: "Entreprise trouvée",
              ...entrepriseSchema,
            },
            404: {
              description: "Entreprise non trouvée",
              ...errorSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const entreprise = await entrepriseController.getEntrepriseBySiret(
          request.params.siret
        );
        if (!entreprise)
          return reply.code(404).send({ error: "Entreprise non trouvée" });
        reply.send(entreprise);
      }
    );

    // Rechercher des entreprises par nom
    fastify.get(
      "/search/:term",
      {
        schema: {
          tags: ["Entreprises"],
          summary: "Rechercher des entreprises",
          description: "Rechercher des entreprises par nom",
          security: [{ Bearer: [] }],
          params: {
            type: "object",
            properties: {
              term: { type: "string", description: "Terme de recherche" },
            },
            required: ["term"],
          },
          response: {
            200: {
              description: "Résultats de la recherche",
              type: "array",
              items: entrepriseSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const entreprises = await entrepriseController.searchEntreprisesByName(
          request.params.term
        );
        reply.send(entreprises);
      }
    );

    // Créer une nouvelle entreprise
    fastify.post(
      "/",
      {
        schema: {
          tags: ["Entreprises"],
          summary: "Créer une entreprise",
          description: "Créer une nouvelle entreprise",
          security: [{ Bearer: [] }],
          body: {
            type: "object",
            required: ["nom", "siret"],
            properties: {
              nom: { type: "string" },
              description: { type: "string" },
              siret: { type: "string", minLength: 14, maxLength: 14 },
            },
          },
          response: {
            201: {
              description: "Entreprise créée avec succès",
              type: "object",
              properties: {
                message: { type: "string" },
                entreprise: entrepriseSchema,
              },
            },
            400: {
              description: "Erreur de validation",
              ...errorSchema,
            },
          },
        },
      },
      async (request, reply) => {
        try {
          const entreprise = await entrepriseController.createEntreprise(
            request.body
          );
          reply.code(201).send({
            message: "Entreprise créée avec succès",
            entreprise,
          });
        } catch (err) {
          reply.code(400).send({ error: err.message });
        }
      }
    );

    // Mettre à jour une entreprise
    fastify.put(
      "/:id",
      {
        schema: {
          tags: ["Entreprises"],
          summary: "Update an entreprise",
          description: "Update an entreprise by its numeric ID",
          security: [{ Bearer: [] }],
          params: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "ID de l'entreprise",
                format: "uuid",
              },
            },
            required: ["id"],
          },
          body: {
            type: "object",
            properties: {
              nom: { type: "string" },
              description: { type: "string" },
              siret: { type: "string", minLength: 14, maxLength: 14 },
            },
          },
          response: {
            200: {
              description: "Entreprise updated successfully",
              type: "object",
              properties: {
                message: { type: "string" },
                entreprise: entrepriseSchema,
              },
            },
            404: {
              description: "Entreprise not found",
              ...errorSchema,
            },
          },
        },
      },
      async (request, reply) => {
        try {
          // Correction: use the correct param name and validate it
          const id = request.params.id;
          if (!id) {
            return reply
              .code(400)
              .send({ error: "Missing entreprise id in request parameters" });
          }
          // According to the schema, id is a string (uuid)
          const entreprise = await entrepriseController.updateEntreprise(
            id,
            request.body
          );
          if (!entreprise) {
            return reply.code(404).send({ error: "Entreprise not found" });
          }
          reply.send({
            message: "Entreprise updated successfully",
            entreprise,
          });
        } catch (err) {
          reply.code(400).send({ error: err.message });
        }
      }
    );

    // Supprimer une entreprise
    fastify.delete(
      "/:id",
      {
        schema: {
          tags: ["Entreprises"],
          summary: "Delete an entreprise",
          description: "Delete an entreprise",
          security: [{ Bearer: [] }],
          params: {
            type: "object",
            properties: {
              id: {
                type: "integer",
                description: "ID of the entreprise",
                format: "uuid",
              },
            },
            required: ["id"],
          },
          response: {
            200: {
              description: "Entreprise deleted successfully",
              ...successSchema,
            },
            404: {
              description: "Entreprise not found",
              ...errorSchema,
            },
          },
        },
      },
      async (request, reply) => {
        try {
          const id = request.params.id;
          if (!id) {
            return reply
              .code(400)
              .send({ error: "Missing entreprise id in request parameters" });
          }
          const result = await entrepriseController.deleteEntreprise(
            id
          );
          if (!result) {
            return reply.code(404).send({ error: "Entreprise not found" });
          }
          reply.send({ message: "Entreprise deleted successfully" });
        } catch (err) {
          reply.code(400).send({ error: err.message });
        }
      }
    );
  });
};
