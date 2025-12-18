import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We merge process.env to ensure Vercel system variables are captured.
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  return {
    plugins: [react()],
    // ----------------------------------------------------
    // ADD THIS SECTION HERE:
    server: {
      host: true,        // Allows network access (required for ngrok)
      allowedHosts: true // Disables the security check blocking ngrok
    },
    // ----------------------------------------------------
    define: {
      // This allows 'process.env.API_KEY' to work in the browser by replacing it with the value from env
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
})