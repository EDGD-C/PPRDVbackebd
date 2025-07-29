const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000';
let token = null;
let cookies = null;

// Fonction pour effectuer des requêtes avec gestion des cookies
async function request(method, url, data = null, useToken = false) {
  const headers = {};
  
  // Ajouter le token JWT si disponible et demandé
  if (token && useToken) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ajouter les cookies si disponibles
  if (cookies) {
    headers['Cookie'] = cookies;
  }
  
  try {
    const response = await axios({
      method,
      url: `${API_URL}${url}`,
      data,
      headers,
      withCredentials: true, // Important pour les cookies
      validateStatus: () => true // Ne pas rejeter les erreurs HTTP
    });
    
    // Stocker les cookies pour les requêtes suivantes
    if (response.headers['set-cookie']) {
      cookies = response.headers['set-cookie'].join('; ');
      console.log('Cookies reçus:', cookies);
    }
    
    return response;
  } catch (error) {
    console.error(`Erreur lors de la requête ${method} ${url}:`, error.message);
    throw error;
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🧪 Démarrage des tests de session...');
  
  try {
    // 1. Test de la route session-test (sans authentification)
    console.log('\n1️⃣ Test de la route session-test (compteur)');
    let response = await request('GET', '/session-test');
    console.log('Réponse:', response.data);
    
    // 2. Incrémentation du compteur
    console.log('\n2️⃣ Test d\'incrémentation du compteur');
    response = await request('GET', '/session-test');
    console.log('Réponse:', response.data);
    
    // 3. Inscription d'un utilisateur de test
    console.log('\n3️⃣ Inscription d\'un utilisateur de test');
    response = await request('POST', '/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Statut:', response.status);
    console.log('Réponse:', response.data);
    
    // 4. Connexion avec l'utilisateur
    console.log('\n4️⃣ Connexion avec l\'utilisateur');
    response = await request('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Statut:', response.status);
    console.log('Réponse:', response.data);
    
    // Stocker le token JWT
    if (response.data && response.data.token) {
      token = response.data.token;
      console.log('Token JWT stocké:', token.substring(0, 20) + '...');
    }
    
    // 5. Vérifier les informations de session
    console.log('\n5️⃣ Vérifier les informations de session');
    response = await request('GET', '/api/auth/session');
    console.log('Statut:', response.status);
    console.log('Réponse:', response.data);
    
    // 6. Accéder au profil utilisateur (avec session)
    console.log('\n6️⃣ Accéder au profil utilisateur (avec session)');
    response = await request('GET', '/api/users/profile');
    console.log('Statut:', response.status);
    console.log('Réponse:', response.data);
    
    // 7. Accéder au profil utilisateur (avec token JWT)
    console.log('\n7️⃣ Accéder au profil utilisateur (avec token JWT)');
    // Supprimer les cookies pour tester l'authentification par JWT uniquement
    cookies = null;
    response = await request('GET', '/api/users/profile', null, true);
    console.log('Statut:', response.status);
    console.log('Réponse:', response.data);
    
    // 8. Déconnexion
    console.log('\n8️⃣ Déconnexion');
    response = await request('POST', '/api/auth/logout');
    console.log('Statut:', response.status);
    console.log('Réponse:', response.data);
    
    // 9. Vérifier la session après déconnexion
    console.log('\n9️⃣ Vérifier la session après déconnexion');
    response = await request('GET', '/api/auth/session');
    console.log('Statut:', response.status);
    console.log('Réponse:', response.data);
    
    console.log('\n✅ Tests terminés avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests
runTests(); 