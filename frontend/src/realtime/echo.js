import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY || 'monkey',
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
  forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || 'http') === 'https',
  wsHost: import.meta.env.VITE_PUSHER_HOST || import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
  wsPort: import.meta.env.VITE_PUSHER_PORT || import.meta.env.VITE_REVERB_PORT || 6001,
  wssPort: import.meta.env.VITE_PUSHER_PORT || import.meta.env.VITE_REVERB_PORT || 6001,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
})

export default echo