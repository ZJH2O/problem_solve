import { Client } from '@stomp/stompjs'
import type { IFrame as Frame, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'

class WebSocketService {
  private client: Client | null = null
  private reconnectDelay = 5000
  private isConnected = false

  constructor() {
    this.client = new Client({
      // WebSocket连接配置
      webSocketFactory: () => {
        return new SockJS('http://localhost:8081/ws-notifications')
      },

      // 调试日志
      debug: (str) => {
        console.log('STOMP:', str)
      },

      // 重连延迟
      reconnectDelay: this.reconnectDelay,

      // 心跳配置
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    // 连接成功回调
    this.client.onConnect = this.onConnect.bind(this)

    // 断开连接回调
    this.client.onDisconnect = this.onDisconnect.bind(this)

    // 错误回调
    this.client.onStompError = this.onError.bind(this)
  }

  // 连接WebSocket
  connect() {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn) {
      console.error('用户未登录，无法连接WebSocket')
      return
    }

    try {
      this.client?.activate()
    } catch (error) {
      console.error('WebSocket连接失败:', error)
    }
  }

  // 断开连接
  disconnect() {
    if (this.client?.active) {
      this.client.deactivate()
    }
  }

  // 连接成功处理
  private onConnect(frame: Frame) {
    console.log('WebSocket连接成功:', frame)
    this.isConnected = true

    const userStore = useUserStore()
    const notificationStore = useNotificationStore()

    // 发送连接消息
    this.client?.publish({
      destination: '/app/connect',
      body: JSON.stringify({ userId: userStore.userInfo?.userId })
    })

    // 订阅用户专属通知通道
    const userId = userStore.userInfo?.userId
    if (userId) {
      this.client?.subscribe(`/user/${userId}/notifications`, (message: IMessage) => {
        this.handleNotification(message)
      })
    }

    // 订阅公共通道
    this.client?.subscribe('/topic/connected', (message: IMessage) => {
      console.log('连接状态:', JSON.parse(message.body))
    })
  }

  // 断开连接处理
  private onDisconnect() {
    console.log('WebSocket断开连接')
    this.isConnected = false
  }

  // 错误处理
  private onError(frame: Frame) {
    console.error('WebSocket错误:', frame)
  }

// 在处理消息的部分添加私信支持
private handleNotification(message: IMessage) {
  try {
    const data = JSON.parse(message.body)
    console.log('收到实时消息:', data)

    if (data.type === 'notification' && data.data) {
      const notificationStore = useNotificationStore()
      notificationStore.addRealtimeNotification(data.data)
      this.playNotificationSound()
      this.showBrowserNotification(data.data)
    } else if (data.type === 'private_message' && data.data) {
      // 处理私信消息
      const chatStore = useChatStore()
      chatStore.receiveMessage(data.data)

      // 如果不在聊天页面或不是当前聊天窗口，显示通知
      const currentPath = window.location.pathname
      if (!currentPath.includes('/chat') ||
          chatStore.currentChat?.friendUserId !== data.data.senderId) {
        this.showMessageNotification(data.data)
      }
    }
  } catch (error) {
    console.error('处理消息失败:', error)
  }
}

// 添加消息通知方法
private showMessageNotification(message: any) {
  // 播放提示音
  this.playNotificationSound()

  // 显示桌面通知
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`${message.senderName || '好友'} 发来新消息`, {
      body: message.messageType === 0 ? message.content :
            message.messageType === 1 ? '[图片]' : '[文件]',
      icon: message.senderAvatar || '/logo.png',
      tag: `message-${message.messageId}`
    })
  }
}

  // 播放提示音
  private playNotificationSound() {
    const audio = new Audio('/notification-sound.mp3')
    audio.volume = 0.5
    audio.play().catch(e => console.log('播放提示音失败:', e))
  }

  // 显示浏览器通知
  private async showBrowserNotification(notification: any) {
    if (!('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/logo.png',
        tag: `notification-${notification.notificationId}`
      })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        this.showBrowserNotification(notification)
      }
    }
  }

  // 获取连接状态
  get connected() {
    return this.isConnected
  }
}

// 导出单例
export default new WebSocketService()
