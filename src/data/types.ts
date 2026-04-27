export type VideoState =
  | 'idle'
  | 'preview'
  | 'active_ready'
  | 'playing'
  | 'paused'
  | 'backgrounded'
  | 'offscreen_suspended';

export interface Story {
  id: string;
  location: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl?: string;
  ctaUrl?: string;
  blurhash?: string;
  duration?: number;
}

export interface VideoPlayerRef {
  transitionTo: (state: VideoState) => Promise<void>;
  getCurrentState: () => VideoState;
  setMuted: (muted: boolean) => Promise<void>;
  getIsMuted: () => boolean;
}
