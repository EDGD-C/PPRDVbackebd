const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

async function testUnifiedAuthentication() {
  console.log('🧪 Test d\'authentification unifiée\n');

  try {
    // Test 1: Connexion admin
    console.log('1️⃣ Test de connexion admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('✅ Connexion admin réussie !');
    console.log('   Token:', adminLoginResponse.data.token ? '✅ Présent' : '❌ Manquant');
    console.log('   Role:', adminLoginResponse.data.user.role);
    console.log('   Username:', adminLoginResponse.data.user.username);

    const adminToken = adminLoginResponse.data.token;

    // Test 2: Connexion client
    console.log('\n2️⃣ Test de connexion client...');
    const clientLoginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'client1@example.com',
      password: 'client123'
    });

    console.log('✅ Connexion client réussie !');
    console.log('   Token:', clientLoginResponse.data.token ? '✅ Présent' : '❌ Manquant');
    console.log('   Role:', clientLoginResponse.data.user.role);
    console.log('   Nom:', clientLoginResponse.data.user.nom);
    console.log('   Première connexion:', clientLoginResponse.data.needsPasswordChange ? 'Oui' : 'Non');

    const clientToken = clientLoginResponse.data.token;

    // Test 3: Changement de mot de passe client
    console.log('\n3️⃣ Test de changement de mot de passe client...');
    const changePasswordResponse = await axios.post(`${BASE_URL}/change-password`, {
      currentPassword: 'client123',
      newPassword: 'nouveauMotDePasse123'
    }, {
      headers: {
        'Authorization': `Bearer ${clientToken}`
      }
    });

    console.log('✅ Mot de passe client changé avec succès !');
    console.log('   Première connexion après changement:', changePasswordResponse.data.user.isFirstLogin ? 'Oui' : 'Non');

    // Test 4: Connexion avec le nouveau mot de passe
    console.log('\n4️⃣ Test de connexion avec le nouveau mot de passe...');
    const newClientLoginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'client1@example.com',
      password: 'nouveauMotDePasse123'
    });

    console.log('✅ Connexion avec nouveau mot de passe réussie !');
    console.log('   Première connexion:', newClientLoginResponse.data.needsPasswordChange ? 'Oui' : 'Non');

    // Test 5: Vérification de session
    console.log('\n5️⃣ Test de vérification de session...');
    const sessionResponse = await axios.get(`${BASE_URL}/session`, {
      headers: {
        'Authorization': `Bearer ${newClientLoginResponse.data.token}`
      }
    });

    console.log('✅ Session vérifiée !');
    console.log('   Authentifié:', sessionResponse.data.isAuthenticated ? 'Oui' : 'Non');
    console.log('   Role:', sessionResponse.data.user.role);

    // Test 6: Création d'un nouveau client par admin
    console.log('\n6️⃣ Test de création d\'un nouveau client par admin...');
    const createClientResponse = await axios.post(`${BASE_URL}/create-client`, {
      nom: 'Nouveau Client',
      email: 'nouveau@example.com',
      nomEntreprise: 'Nouvelle Entreprise',
      entrepriseId: 1
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    console.log('✅ Nouveau client créé avec succès !');
    console.log('   Email:', createClientResponse.data.client.email);
    console.log('   Mot de passe par défaut:', createClientResponse.data.defaultPassword);

    // Test 7: Connexion du nouveau client
    console.log('\n7️⃣ Test de connexion du nouveau client...');
    const newClientLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'nouveau@example.com',
      password: createClientResponse.data.defaultPassword
    });

    console.log('✅ Connexion du nouveau client réussie !');
    console.log('   Première connexion:', newClientLogin.data.needsPasswordChange ? 'Oui' : 'Non');

    // Test 8: Réinitialisation du mot de passe par admin
    console.log('\n8️⃣ Test de réinitialisation du mot de passe par admin...');
    const resetPasswordResponse = await axios.post(`${BASE_URL}/admin/reset-client-password/2`, {}, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    console.log('✅ Mot de passe client réinitialisé !');
    console.log('   Mot de passe par défaut:', resetPasswordResponse.data.defaultPassword);

    // Test 9: Connexion avec le mot de passe réinitialisé
    console.log('\n9️⃣ Test de connexion avec le mot de passe réinitialisé...');
    const resetLoginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'client2@example.com',
      password: resetPasswordResponse.data.defaultPassword
    });

    console.log('✅ Connexion avec mot de passe réinitialisé réussie !');
    console.log('   Première connexion:', resetLoginResponse.data.needsPasswordChange ? 'Oui' : 'Non');

    // Test 10: Récupération du profil utilisateur
    console.log('\n🔟 Test de récupération du profil utilisateur...');
    const profileResponse = await axios.get(`${BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    console.log('✅ Profil utilisateur récupéré !');
    console.log('   Role:', profileResponse.data.user.role);
    console.log('   Email:', profileResponse.data.user.email);

    console.log('\n🎉 Tous les tests d\'authentification unifiée sont passés !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Vérifiez que le serveur est démarré et que la base de données est initialisée');
    }
  }
}

// Test de performance
async function testPerformance() {
  console.log('\n⚡ Test de performance...');
  
  const startTime = Date.now();
  
  try {
    // Test de connexion multiple
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        axios.post(`${BASE_URL}/login`, {
          email: 'admin@example.com',
          password: 'admin123'
        })
      );
    }
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Test de performance terminé en ${duration}ms`);
    console.log(`   Moyenne: ${duration / 5}ms par requête`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test de performance:', error.message);
  }
}

// Exécuter les tests
async function runTests() {
  await testUnifiedAuthentication();
  await testPerformance();
}

runTests(); 