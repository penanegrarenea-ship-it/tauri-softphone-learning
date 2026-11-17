export type CallState = 'idle' | 'dialing' | 'connected';
export const normalizeNumber = (value: string) => value.replace(/[^0-9*#+]/g, '').slice(0, 24);
export const formatDuration = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
export interface CallRecord { number: string; time: string; duration: number }
