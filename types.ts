export enum AppMode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT'
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface ImageUploadState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
  mimeType: string | null;
}
