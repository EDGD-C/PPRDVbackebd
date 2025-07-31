
const fetch = require('node-fetch');

fastify.post('/company/data/simple', async (request, reply) => {
  const { siret } = request.body;

  const res = await fetch('http://57.128.179.56:5679/webhook/778578e9-2449-4ed6-9a4a-9614ee6014de98', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siret })
  });

  const data = {
    siret,
    forme_juridique,
    nom_entreprise,
    adresse_ligne_1,
    ville,
    code_postal,
    pays
    } = await res.json();

  return {
    ok: 201,
    simpleCompanyData: data
  };
});