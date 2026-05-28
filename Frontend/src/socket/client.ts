/**
 * Socket.IO client singleton.
 * Manages a single socket connection with auto-reconnect.
 *
 * SETUP: Install socket.io-client before using realtime features:
 *   npm install socket.io-client
 */

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let socket: any = null;

/**
 * Get or create the Socket.IO client instance.
 * Lazily initializes the connection on first call.
 *
 * @throws {Error} if socket.io-client is not installed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSocket(): Promise<any> {
  if (socket?.connected) return socket;

  // Dynamic import — will throw at runtime if socket.io-client is not installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  let io: any;
  try {
    const mod = await (Function('return import("socket.io-client")')() as Promise<any>);
    io = mod.io;
  } catch {
    throw new Error(
      'socket.io-client is not installed. Run: npm install socket.io-client'
    );
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

/** Disconnect and cleanup the socket instance */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
