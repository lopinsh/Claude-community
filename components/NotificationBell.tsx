'use client'
// components/NotificationBell.tsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  ActionIcon,
  Indicator,
  Menu,
  Text,
  ScrollArea,
  Badge,
  Group,
  Stack,
  Button,
  Loader,
  Alert,
} from '@mantine/core'
import { IconBell, IconCheck, IconMessage, IconUser, IconCalendar } from '@tabler/icons-react'
import { notifications as mantineNotifications } from '@mantine/notifications'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message?: string
  isRead: boolean
  createdAt: string
  activity?: {
    id: string
    title: string
  }
  application?: {
    id: string
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'NEW_APPLICATION':
      return <IconUser size={16} />
    case 'APPLICATION_ACCEPTED':
    case 'APPLICATION_DECLINED':
      return <IconCheck size={16} />
    case 'NEW_MESSAGE':
      return <IconMessage size={16} />
    case 'ACTIVITY_UPDATE':
      return <IconCalendar size={16} />
    default:
      return <IconBell size={16} />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'NEW_APPLICATION':
      return 'blue'
    case 'APPLICATION_ACCEPTED':
      return 'green'
    case 'APPLICATION_DECLINED':
      return 'red'
    case 'NEW_MESSAGE':
      return 'violet'
    case 'ACTIVITY_UPDATE':
      return 'orange'
    default:
      return 'gray'
  }
}

export default function NotificationBell() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [opened, setOpened] = useState(false)

  // Fetch unread count
  useEffect(() => {
    if (!session?.user) return

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications?count=true')
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }

    fetchUnreadCount()
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [session])

  // Fetch notifications when menu is opened
  const fetchNotifications = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      mantineNotifications.show({
        title: 'Error',
        message: 'Failed to load notifications',
        color: 'red'
      })
    }
    setLoading(false)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH'
      })
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH'
      })
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        )
        setUnreadCount(0)
        mantineNotifications.show({
          title: 'Success',
          message: 'All notifications marked as read',
          color: 'green'
        })
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      mantineNotifications.show({
        title: 'Error',
        message: 'Failed to mark notifications as read',
        color: 'red'
      })
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    setOpened(false)
    
    // Navigate to activity if available
    if (notification.activity) {
      window.location.href = `/activities/${notification.activity.id}`
    }
  }

  if (!session?.user) return null

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      onOpen={fetchNotifications}
      position="bottom-end"
      width={350}
      offset={5}
    >
      <Menu.Target>
        <Indicator
          color="red"
          size={16}
          label={unreadCount > 99 ? '99+' : unreadCount}
          disabled={unreadCount === 0}
        >
          <ActionIcon variant="subtle" size="lg">
            <IconBell size={18} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Group justify="space-between" p="xs" pb={0}>
          <Text fw={600} size="sm">Notifications</Text>
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="compact-xs"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </Group>

        <ScrollArea.Autosize mah={400} mx="-xs">
          {loading ? (
            <Group justify="center" p="md">
              <Loader size="sm" />
            </Group>
          ) : notifications.length === 0 ? (
            <Alert variant="light" color="gray" m="xs">
              <Text size="sm">No notifications yet</Text>
            </Alert>
          ) : (
            <Stack gap={0}>
              {notifications.slice(0, 10).map((notification) => (
                <Menu.Item
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    backgroundColor: notification.isRead ? undefined : 'var(--mantine-color-blue-0)',
                    borderLeft: notification.isRead ? undefined : '3px solid var(--mantine-color-blue-5)',
                    cursor: 'pointer'
                  }}
                >
                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Badge
                      color={getNotificationColor(notification.type)}
                      variant="light"
                      size="lg"
                      circle
                      p={4}
                    >
                      {getNotificationIcon(notification.type)}
                    </Badge>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {notification.title}
                      </Text>
                      {notification.message && (
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {notification.message}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed" mt={2}>
                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </div>
                    
                    {!notification.isRead && (
                      <Badge color="blue" size="xs" variant="filled" w={8} h={8} p={0} />
                    )}
                  </Group>
                </Menu.Item>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>

        {notifications.length > 10 && (
          <Menu.Item onClick={() => { setOpened(false); window.location.href = '/notifications'; }}>
            <Text size="sm" ta="center" c="dimmed">
              View all notifications
            </Text>
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}