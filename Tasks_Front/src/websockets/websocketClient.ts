// src/websockets/websocketClient.ts

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

/**
 * WebSocket Client - Centralized Echo instance management
 * 
 * Similar to ApiClient for REST API, this provides a single WebSocket connection
 * that can be reused across the entire application.
 * 
 * Usage:
 * 1. Initialize: websocketClient.initialize()
 * 2. Subscribe: websocketClient.subscribe('channel', 'event', callback)
 * 3. Unsubscribe: websocketClient.unsubscribe('channel')
 * 4. Cleanup: websocketClient.disconnect()
 */
class WebSocketClient {
  private echo: Echo<any> | null = null;
  private subscribedChannels: Map<string, any> = new Map();

  /**
   * Initialize Echo instance
   * Should be called once when the app starts or when user logs in
   */
  initialize(): void {
    if (this.echo) {
      console.warn('WebSocket already initialized');
      return;
    }

    // Set up Pusher
    window.Pusher = Pusher;
    
    // Create Echo instance with Reverb configuration
    this.echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: import.meta.env.VITE_REVERB_PORT ?? 8789,
      wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      },
    });

    // Make Echo globally available
    window.Echo = this.echo;
    
    console.log('✅ WebSocket initialized');
  }

  /**
   * Subscribe to a public channel and listen for events
   * 
   * @param channelName - Name of the channel (e.g., 'clocking.manager')
   * @param eventName - Name of the event (e.g., 'ClockSessionUpdated')
   * @param callback - Function to call when event is received
   */
subscribe<T = any>(
  channelName: string,
  eventName: string,
  callback: (data: T) => void
): void {
  if (!this.echo) {
    console.error('WebSocket not initialized. Call initialize() first.');
    return;
  }

  if (this.subscribedChannels.has(channelName)) {
    console.warn(`Already subscribed to ${channelName}`);
    return;
  }

  const channel = this.echo.channel(channelName);
  
  // FIX: Laravel Echo requires dot prefix for public channel events
  const echoEventName = eventName.startsWith('.') ? eventName : `.${eventName}`;
  
  console.log(`📡 Listening for event: ${echoEventName}`);
  
  channel.listen(echoEventName, (data: any) => {
    console.group(`🔵 [LEVEL 1] WebSocket Raw Event Received`);
    console.log('Channel:', channelName);
    console.log('Event:', eventName);
    console.log('Raw Data:', data);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
    
    callback(data as T);
  });
  
  channel.subscribed(() => {
    console.log(`✅ Subscribed to ${channelName}`);
  });

  channel.error((error: any) => {
    console.error(`❌ Error on ${channelName}:`, error);
  });

  this.subscribedChannels.set(channelName, channel);
}

  /**
   * Unsubscribe from a channel
   * 
   * @param channelName - Name of the channel to unsubscribe from
   */
  unsubscribe(channelName: string): void {
    if (!this.echo) return;

    if (this.subscribedChannels.has(channelName)) {
      this.echo.leave(channelName);
      this.subscribedChannels.delete(channelName);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Check if currently subscribed to a channel
   * 
   * @param channelName - Name of the channel
   * @returns True if subscribed, false otherwise
   */
  isSubscribed(channelName: string): boolean {
    return this.subscribedChannels.has(channelName);
  }

  /**
   * Disconnect all channels and clean up
   * Should be called on logout or app unmount
   */
  disconnect(): void {
    if (!this.echo) return;

    // Leave all subscribed channels
    this.subscribedChannels.forEach((_, channelName) => {
      this.echo?.leave(channelName);
    });
    
    // Clear tracking
    this.subscribedChannels.clear();
    
    // Nullify Echo instance
    this.echo = null;
    
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Get Echo instance for advanced usage
   * 
   * @returns Echo instance or null if not initialized
   */
  getEcho(): Echo<any> | null {
    return this.echo;
  }
}

// Export singleton instance
export const websocketClient = new WebSocketClient();
