import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

async function debugUsers() {
  try {
    // Initialiser la connexion à la base de données
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const userRepository = AppDataSource.getRepository(User);

    // Récupérer tous les utilisateurs
    const users = await userRepository.find();
    console.log(`\n📋 Liste des utilisateurs (${users.length} trouvés) :\n`);

    for (const [index, user] of users.entries()) {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Actif: ${user.isActive ? 'Oui' : 'Non'}`);
      console.log(`   ID: ${user.id}`);
      console.log('   ---');
    }

    // Vérifier spécifiquement les admins
    const admins = users.filter(user => user.role === 'admin');
    console.log(`\n👑 Utilisateurs avec rôle admin (${admins.length}) :`);
    for (const admin of admins) {
      console.log(`   - ${admin.email} (ID: ${admin.id})`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du débogage :', error);
  } finally {
    // Fermer la connexion
    await AppDataSource.destroy();
    console.log('\n🔌 Connexion à la base de données fermée');
  }
}

// Exécuter le script
debugUsers();
