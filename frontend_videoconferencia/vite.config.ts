import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Certificado autofirmado: necesario para usar camara/microfono desde
    // otras computadoras (ej. conectadas por Hamachi), ya que el navegador
    // exige un contexto seguro (HTTPS) fuera de localhost.
    basicSsl(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Escucha en todas las interfaces de red para que otras PCs de la
    // misma red (o de la red virtual de Hamachi) puedan acceder al sitio.
    host: true,
  },
})
