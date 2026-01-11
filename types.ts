
export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Track {
  id: string;
  time: string;
  title: string;
  duration: string;
  link?: string;
  isActive?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: GroundingSource[];
}

export enum PlayerState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  BUFFERING = 'BUFFERING'
}
