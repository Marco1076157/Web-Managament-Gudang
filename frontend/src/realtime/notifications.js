import { useEffect, useState } from 'react'
import echo from './echo'

export const useTransactionNotifications = (enabled = true) => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!enabled) return

    const channel = echo.channel('managers')
    const listener = (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 20))
    }

    channel.listen('.transaction.created', listener)
    channel.listen('.stock.low', (data) => {
      setNotifications((prev) => [{ ...data, type: 'stock.low' }, ...prev].slice(0, 20))
    })

    return () => {
      channel.stopListening('.transaction.created', listener)
      channel.stopListening('.stock.low')
    }
  }, [enabled])

  return { notifications, clear: () => setNotifications([]) }
}