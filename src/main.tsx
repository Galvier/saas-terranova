import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/density.css'

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registered successfully:', registration);
      
      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
