import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: true,
    
    // Set chunk size warning limit to 500 KB
    chunkSizeWarningLimit: 500,
    
    // Minification and optimization settings (using esbuild for faster builds)
    minify: 'esbuild',
    
    rollupOptions: {
      // Enable tree-shaking
      treeshake: {
        moduleSideEffects: 'no-external',
      },
      
      output: {
        // Manual chunk configuration for code splitting
        manualChunks: (id) => {
          // Vendor chunk: Core React libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Firebase chunk: All Firebase libraries
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase';
            }
            
            // UI libraries chunk: Framer Motion, Lucide React
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            
            // Other vendor libraries
            return 'vendor-other';
          }
        },
        
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
