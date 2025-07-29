const fastify = require('fastify')({logger: true});
const axios = require('axios');

const BRAND_API_KEY = process.env.BRAND_API_KEY;
const BRAND_API_URL = process.env.BRAND_API_URL;

fastify.get('/brands', async (request, reply) => {
    const domain = request.query.domain;
    if (!domain) {
        return reply.code(400).send({ error: 'Domain is required' });
    }

    if (!BRAND_API_KEY) {
        return reply.code(500).send({ error: 'Brand API key is not set' });
    }
    const brandfetchUrl = `https://api.brandfetch.io/v2/brands/${domain}`;

    try {
        const response = await axios.get(brandfetchUrl, {
            headers: {
                'Authorization': `Bearer ${BRAND_API_KEY}`
            }
    });

    const logoObject = response.data.logo.find(logo => logo.type === 'logo');

    if (logoObject && logoObject.formats && logoObject.formats.length > 0) {
        const logoUrl = logoObject.formats[0].src;

        return reply.send({ 
            source: domain,
            logoUrl: logoUrl
         });
    } else {
        return reply.code(404).send({ error: 'No logo found for this domain' });
    }

    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                return reply.code(404).send({ error: 'No brand found for this domain' });
            }
            if (error.response.status === 401) {
                return reply.code(401).send({ error: 'Invalid API key' });
            }
            if (error.response.status === 429) {
                return reply.code(429).send({ error: 'Rate limit exceeded' });
            }
        }
        return reply.code(500).send({ error: 'Failed to fetch brand' });
    }

    
});