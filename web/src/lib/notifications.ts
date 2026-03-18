/**
 * Browser Notification API wrapper — sends desktop notifications for alerts.
 * Requests permission on first call. Queues notifications if permission pending.
 */

let _permission: NotificationPermission = Notification?.permission ?? 'default'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (_permission === 'granted') return true
  _permission = await Notification.requestPermission()
  return _permission === 'granted'
}

export function sendNotification(
  title: string,
  options?: NotificationOptions,
): Notification | null {
  if (!('Notification' in window)) return null
  if (_permission !== 'granted') {
    requestNotificationPermission()
    return null
  }
  try {
    return new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    })
  } catch {
    return null
  }
}

export function notifyAlert(
  severity: string,
  title: string,
  message: string,
): Notification | null {
  const tag = `claw-alert-${Date.now()}`
  return sendNotification(`[${severity.toUpperCase()}] ${title}`, {
    body: message,
    tag,
    requireInteraction: severity === 'critical',
  })
}
