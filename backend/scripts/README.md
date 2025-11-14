# 📜 Backend Scripts - Documentation

> **Scripts utilitaires pour le backend Express/TypeScript**

---

## 📋 Vue d'Ensemble

Ce dossier contient les scripts Node.js/TypeScript pour automatiser diverses tâches backend : migrations de base de données, seeds, tests, backup, et utilitaires de production.

---

## 🗂️ Structure

```
backend/scripts/
├── README.md                  # Ce fichier
├── run-migrations.ts          # Exécuter les migrations TypeORM
├── prepare-production.js      # Préparer l'environnement de production
├── setup/                     # Scripts d'initialisation
│   ├── init-db.ts            # Initialiser la base de données
│   ├── seed-data.ts          # Insérer données de test
│   └── create-admin.ts       # Créer utilisateur admin
├── checks/                    # Scripts de vérification
│   ├── health-check.ts       # Vérifier santé de l'application
│   ├── db-status.ts          # Statut de la base de données
│   └── redis-check.ts        # Vérifier connexion Redis
└── tests/                     # Scripts de tests
    ├── README.md             # Documentation tests
    ├── load-test.ts          # Tests de charge
    └── security-audit.ts     # Audit de sécurité
```

---

## 🚀 Scripts Disponibles

### Migrations

```bash
# Exécuter migrations en attente
npm run migration:run

# Revenir à la migration précédente
npm run migration:revert

# Générer une nouvelle migration
npm run migration:generate -- -n CreateUsersTable

# Créer migration vide
npm run migration:create -- -n AddIndexes
```

### Setup

```bash
# Initialiser base de données
npm run script:init-db

# Insérer données de test
npm run script:seed

# Créer admin
npm run script:create-admin
```

### Checks

```bash
# Health check complet
npm run script:health

# Vérifier base de données
npm run script:db-status

# Vérifier Redis
npm run script:redis-check
```

### Production

```bash
# Préparer environnement production
npm run script:prepare-prod

# Backup base de données
npm run script:backup

# Nettoyer logs anciens
npm run script:clean-logs
```

---

## 📝 Scripts Détaillés

### run-migrations.ts

```typescript
import { AppDataSource } from '../src/config/database';

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();

    console.log('🚀 Running migrations...');
    const migrations = await AppDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('✅ No pending migrations');
    } else {
      console.log(`✅ Executed ${migrations.length} migrations:`);
      migrations.forEach((m) => console.log(`  - ${m.name}`));
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
```

### init-db.ts

```typescript
import { AppDataSource } from '../../src/config/database';

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    await AppDataSource.initialize();

    console.log('📊 Synchronizing schema...');
    await AppDataSource.synchronize();

    console.log('✅ Database initialized successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
```

### seed-data.ts

```typescript
import { AppDataSource } from '../../src/config/database';
import { Property } from '../../src/entities/Property.entity';
import { User } from '../../src/entities/User.entity';

async function seedData() {
  try {
    await AppDataSource.initialize();

    console.log('🌱 Seeding data...');

    // Créer utilisateurs de test
    const users = await AppDataSource.manager.save(User, [
      {
        email: 'admin@shu-no.fr',
        password: 'hashed_password',
        name: 'Admin',
        role: 'admin',
      },
      {
        email: 'user@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'user',
      },
    ]);

    // Créer propriétés de test
    await AppDataSource.manager.save(Property, [
      {
        name: 'Gîte Côte de Goëlo',
        description: 'Magnifique gîte vue mer',
        price: 120,
        capacity: 6,
        city: 'Paimpol',
        country: 'France',
      },
    ]);

    console.log('✅ Data seeded successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
```

---

## 🔧 Configuration package.json

```json
{
  "scripts": {
    "migration:run": "ts-node backend/scripts/run-migrations.ts",
    "migration:revert": "ts-node -r tsconfig-paths/register node_modules/.bin/typeorm migration:revert -d src/config/database.ts",
    "migration:generate": "ts-node -r tsconfig-paths/register node_modules/.bin/typeorm migration:generate -d src/config/database.ts",
    "migration:create": "ts-node -r tsconfig-paths/register node_modules/.bin/typeorm migration:create",
    "script:init-db": "ts-node backend/scripts/setup/init-db.ts",
    "script:seed": "ts-node backend/scripts/setup/seed-data.ts",
    "script:create-admin": "ts-node backend/scripts/setup/create-admin.ts",
    "script:health": "ts-node backend/scripts/checks/health-check.ts",
    "script:db-status": "ts-node backend/scripts/checks/db-status.ts",
    "script:redis-check": "ts-node backend/scripts/checks/redis-check.ts",
    "script:prepare-prod": "node backend/scripts/prepare-production.js"
  }
}
```

---

## 📚 Ressources

- [TypeORM Migrations](https://typeorm.io/migrations)
- [Node.js Scripts](https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/)
- [ts-node Documentation](https://typestrong.org/ts-node/)

---

**Dernière mise à jour:** 28 octobre 2025
