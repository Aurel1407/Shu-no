import { TestDataSource } from './test-database';

// Configuration globale pour les tests
beforeAll(async () => {
  try {
    console.log('🔧 Initialisation de la base de données de test...');

    // Initialiser la base de données de test
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
      console.log('✅ Base de données de test initialisée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  try {
    // Fermer la connexion à la base de données
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
      console.log('🗑️ Connexion à la base de données fermée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la base de données:', error);
  }
});

beforeEach(async () => {
  // Réinitialiser tous les mocks avant chaque test
  jest.clearAllMocks();
});
