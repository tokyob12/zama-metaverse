// vite.config.js

import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './', 
  
  assetsInclude: [
    '**/*.glb', 
    '**/*.gltf', 
    '**/*.hdr', 
    '**/*.m4a', 
    '**/*.mp3', 
    '**/*.wav',
    "**/*.wasm"
  ], 

  build: {
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },

  server: {
    open: 'index.html',
    mime: {
      'application/octet-stream': ['.glb', '.gltf'],
      'image/hdr': ['.hdr']
    }
  },
  
  // 1. STANDARD BABYLON/RECAST FIX
  resolve: {
    alias: [
      { find: 'recast', replacement: '' } 
    ]
  },
  
  
  optimizeDeps: {
  
    
    include: [
      '@babylonjs/core/Legacy/legacy',
    ],
    exclude: [
      // Exclude these so their side-effect code runs as expected
      '@babylonjs/core', 
      '@babylonjs/loaders/glTF',
      '@babylonjs/havok',
      "@zama-fhe/relayer-sdk"

    ]
  }
});