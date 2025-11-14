import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    // Initialiser la connexion à la base de données
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const userRepository = AppDataSource.getRepository(User);

    // Trouver l'utilisateur admin
    const adminUser = await userRepository.findOne({
      where: { email: 'aurel140783@gmail.com' }
    });

    if (!adminUser) {
      console.log('❌ Utilisateur aurel140783@gmail.com non trouvé');
      return;
    }

    // Nouveau mot de passe
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await userRepository.update(adminUser.id, {
      password: hashedPassword
    });

    console.log('✅ Mot de passe réinitialisé avec succès !');
    console.log('📧 Email : aurel140783@gmail.com');
    console.log('🔑 Nouveau mot de passe : admin123');
    console.log('⚠️  Pensez à changer le mot de passe en production !');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation du mot de passe :', error);
  } finally {
    // Fermer la connexion
    await AppDataSource.destroy();
    console.log('\n🔌 Connexion à la base de données fermée');
  }
}

// Exécuter le script
resetAdminPassword();
