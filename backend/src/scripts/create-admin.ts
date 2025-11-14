import 'reflect-metadata';
import { config } from 'dotenv';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

// Charger les variables d'environnement
config();

async function createAdminUser() {
  try {
    // Initialiser la connexion à la base de données
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const userRepository = AppDataSource.getRepository(User);

    // Vérifier si un admin existe déjà
    const existingAdmin = await userRepository.findOne({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      console.log('⚠️  Un utilisateur admin existe déjà :', existingAdmin.email);
      return;
    }

    // Créer l'utilisateur admin
    const adminData = {
      email: 'admin@shu-no.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'Shu-no',
      role: 'admin',
    };

    const adminUser = userRepository.create(adminData);
    await userRepository.save(adminUser);

    console.log('✅ Utilisateur admin créé avec succès !');
    console.log('📧 Email : admin@shu-no.com');
    console.log('🔑 Mot de passe : admin123');
    console.log('⚠️  Pensez à changer le mot de passe en production !');
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'utilisateur admin :", error);
  } finally {
    // Fermer la connexion
    await AppDataSource.destroy();
    console.log('🔌 Connexion à la base de données fermée');
  }
}

// Exécuter le script
createAdminUser();
