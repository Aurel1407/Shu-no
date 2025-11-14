import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

async function setupTestDatabase() {
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_ADMIN_USER || 'postgres', // Utilisateur admin pour créer la DB
    password: process.env.DB_ADMIN_PASSWORD || 'postgres',
    database: 'postgres' // Se connecter à la DB par défaut
  });

  try {
    console.log('🔧 Configuration de la base de données de test...');

    await adminClient.connect();

    const testDbName = process.env.DB_NAME || 'test_db';
    const testUser = process.env.DB_USERNAME || 'test_user';
    const testPassword = process.env.DB_PASSWORD || 'test_password';

    // Vérifier si l'utilisateur existe, sinon le créer
    const userExists = await adminClient.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [testUser]
    );

    if (userExists.rows.length === 0) {
      console.log(`👤 Création de l'utilisateur ${testUser}...`);
      await adminClient.query(`CREATE USER ${testUser} WITH PASSWORD '${testPassword}'`);
      await adminClient.query(`GRANT ${testUser} TO CURRENT_USER`);
    }

    // Vérifier si la base de données existe, sinon la créer
    const dbExists = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [testDbName]
    );

    if (dbExists.rows.length > 0) {
      console.log(`🗑️ Suppression de la base de données existante ${testDbName}...`);
      // Terminer toutes les connexions à la base de données
      await adminClient.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [testDbName]);
      await adminClient.query(`DROP DATABASE ${testDbName}`);
    }

    console.log(`📦 Création de la base de données ${testDbName}...`);
    await adminClient.query(`CREATE DATABASE ${testDbName} OWNER ${testUser}`);

    // Donner les permissions nécessaires
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${testDbName} TO ${testUser}`);

    console.log('✅ Configuration de la base de données de test terminée');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration de la base de données:', error);
    throw error;
  } finally {
    await adminClient.end();
  }
}

// Exécuter seulement si appelé directement
if (require.main === module) {
  setupTestDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { setupTestDatabase };
