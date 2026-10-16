import { createContext, useContext } from 'react'
export const NotificationContext = createContext<{ count: number | null; refresh: () => void } | null>(null)
export function useUnreadNotifications() { return useContext(NotificationContext) }
