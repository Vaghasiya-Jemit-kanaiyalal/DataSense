/**
 * Socket.IO event name constants.
 * Use these for type-safe event emission and listening.
 */
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_USERS: 'room-users',
  DATA_UPDATE: 'data-update',
  DATA_SYNC: 'data-sync',
  CURSOR_MOVE: 'cursor-move',
  CLEANING_ACTION: 'cleaning-action',
  CLEANING_UNDO: 'cleaning-undo',
  CLEANING_STATE: 'cleaning-state',
  NOTIFICATION: 'notification',
  ERROR: 'error',
} as const;

export type SocketEvent =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
