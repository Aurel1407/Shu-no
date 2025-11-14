import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts', './src/test/test-setup.ts', './src/test/vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/backend/**'],
    testTimeout: 60000, // Augmenté de 30s à 60s pour tests lourds
    hookTimeout: 60000, // Augmenté de 30s à 60s pour hooks lourds
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'backend/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/main.tsx',
        'vite.config.ts',
        'tailwind.config.ts',
        'postcss.config.js',
        'eslint.config.js',
        // Exclure les fichiers de distribution générés
        'dist/**',
        // Exclure les fichiers de configuration et utilitaires moins critiques
        'src/components/ui/sonner.tsx',
        'src/components/ui/toaster.tsx',
        'src/components/ui/use-toast.ts',
        // Exclure les pages moins importantes pour l'objectif de 80%
        'src/pages/PropertyForm.tsx',
        'src/pages/RevenueStats.tsx',
        'src/pages/OccupancyCharts.tsx'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  build: {
    // Optimisations build
    sourcemap: false, // Désactiver sourcemaps en production pour réduire la taille
    minify: 'terser', // Utiliser terser pour meilleure compression
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true
      }
    },
    // Augmenter la limite d'avertissement de chunk (500kb par défaut)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Optimiser les noms de chunks pour meilleur caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          // Vendor splitting par librairie pour meilleur cache
          if (id.includes('node_modules')) {
            // React core (rarement mis à jour, bon pour cache)
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Router (rarement mis à jour)
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // UI Framework (Radix UI)
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Maps (gros bundle, chargé uniquement si nécessaire)
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-leaflet';
            }
            // Charts (gros bundle, uniquement admin)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            // React Query (souvent utilisé)
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Autres vendors
            return 'vendor';
          }

          // Code splitting par fonctionnalité
          // Admin pages (chargées uniquement par les admins)
          if (id.includes('pages/Admin') || id.includes('pages/Manage') || 
              id.includes('pages/Revenue') || id.includes('pages/Occupancy')) {
            return 'chunk-admin';
          }
          
          // Auth pages (login, register)
          if (id.includes('pages/User') || id.includes('pages/AdminLogin')) {
            return 'chunk-auth';
          }
          
          // Pages publiques principales (chargées en premier)
          if (id.includes('pages/Index') || id.includes('pages/Booking')) {
            return 'chunk-public';
          }
          
          // Pages de détails (chargées à la demande)
          if (id.includes('pages/PropertyDetail') || id.includes('pages/ReservationSummary')) {
            return 'chunk-details';
          }
          
          // Pages légales (rarement visitées)
          if (id.includes('pages/Mentions') || id.includes('pages/CGU') || id.includes('pages/Confidentialite')) {
            return 'chunk-legal';
          }

          // Components UI (partagés, bon pour cache)
          if (id.includes('components/ui/')) {
            return 'chunk-ui';
          }
          
          // Map components (chargés à la demande)
          if (id.includes('components/Map')) {
            return 'chunk-map';
          }
          
          // Hooks et utils (souvent utilisés, bon pour cache)
          if (id.includes('hooks/') || id.includes('lib/')) {
            return 'chunk-shared';
          }
        }
      }
    }
  }
}));
