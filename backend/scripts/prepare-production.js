#!/usr/bin/env node

/**
 * Script de préparation pour l'environnement de production
 */

const fs = require('fs');
const path = require('path');

console.log("🚀 Préparation de l'environnement de production...");

// Créer les dossiers nécessaires
const directories = ['logs', 'uploads', 'uploads/images', 'uploads/documents', 'dist'];

directories.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Dossier créé: ${dir}`);
  } else {
    console.log(`ℹ️  Dossier existe déjà: ${dir}`);
  }
});

// Vérifier les variables d'environnement critiques
console.log("\n🔍 Vérification des variables d'environnement...");

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
];

let missingVars = [];

requiredEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: définie`);
  } else {
    console.log(`❌ ${envVar}: MANQUANTE`);
    missingVars.push(envVar);
  }
});

if (missingVars.length > 0) {
  console.log("\n⚠️  Variables d'environnement manquantes:");
  missingVars.forEach((envVar) => {
    console.log(`   - ${envVar}`);
  });
  console.log('\n📝 Créez un fichier .env basé sur .env.example');
  process.exit(1);
}

// Vérifier la sécurité du JWT_SECRET
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log('⚠️  JWT_SECRET trop court (minimum 32 caractères recommandé)');
}

// Vérifier les permissions des dossiers de logs
try {
  const logDir = path.join(__dirname, '..', 'logs');
  fs.accessSync(logDir, fs.constants.W_OK);
  console.log("✅ Permissions d'écriture OK pour les logs");
} catch (error) {
  console.log('❌ Problème de permissions pour le dossier logs');
  console.error(error.message);
}

console.log('\n🎉 Préparation terminée avec succès!');
console.log("👉 Vous pouvez maintenant démarrer l'application avec: npm start");
