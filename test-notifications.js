async function testNotifications() {
  console.log('🧪 Test des notifications...\n');

  try {
    // Test 1: Vérifier les statistiques
    console.log('📊 Test 1: Récupération des statistiques...');
    const statsResponse = await fetch('http://localhost:3000/api/notifications');
    const stats = await statsResponse.json();
    console.log('✅ Statistiques:', stats);

    // Test 2: Envoyer une notification de test
    console.log('\n📤 Test 2: Envoi d\'une notification de test...');
    const notificationData = {
      title: '🧪 Test Notification',
      message: 'Ceci est une notification de test pour vérifier le système.',
      type: 'system'
    };

    const sendResponse = await fetch('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    const sendResult = await sendResponse.json();
    console.log('✅ Résultat envoi:', sendResult);

    // Test 3: Vérifier les logs de livraison (si disponibles)
    console.log('\n📬 Test 3: Vérification des logs de livraison...');
    const deliveryResponse = await fetch('http://localhost:3000/api/notifications/delivery-status');
    const deliveryData = await deliveryResponse.json();
    console.log('✅ Logs de livraison:', deliveryData);

    console.log('\n🎉 Tests terminés !');
    console.log('\n💡 Pour vérifier si les utilisateurs ont reçu la notification:');
    console.log('1. Vérifiez l\'onglet "📬 Statut Livraison" dans l\'admin');
    console.log('2. Regardez les logs Firebase dans la console');
    console.log('3. Vérifiez les notifications sur vos appareils de test');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('\n💡 Assurez-vous que:');
    console.log('1. Le serveur Next.js est démarré (npm run dev)');
    console.log('2. Firebase est correctement configuré');
    console.log('3. Vous avez des utilisateurs avec des tokens de device');
  }
}

testNotifications();