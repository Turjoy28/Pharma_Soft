import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'

export const worker = setupWorker(...handlers)

// Senior Vite HMR for MSW: auto-reload handlers when handlers.js changes
if (import.meta.hot) {
  import.meta.hot.accept('./handlers.js', (newModule) => {
    if (newModule && newModule.handlers) {
      worker.resetHandlers(...newModule.handlers)
      console.log('[MSW] Handlers hot-reloaded successfully')
    }
  })
}
