'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket } from './client';

/**
 * Hook that provides a Socket.IO client instance.
 * Automatically connects on mount and disconnects on unmount.
 *
 * NOTE: Install socket.io-client before using:
 *   npm install socket.io-client
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSocket(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    getSocket().then((s) => {
      if (mounted) {
        socketRef.current = s;
      }
    });

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, []);

  return socketRef.current;
}

/**
 * Hook that listens to a specific socket event.
 * Automatically cleans up the listener on unmount.
 */
export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void,
): void {
  const savedHandler = useRef(handler);
  savedHandler.current = handler;

  const stableHandler = useCallback((data: T) => {
    savedHandler.current(data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let socket: any = null;

    getSocket().then((s) => {
      socket = s;
      socket.on(event, stableHandler);
    });

    return () => {
      socket?.off(event, stableHandler);
    };
  }, [event, stableHandler]);
}
