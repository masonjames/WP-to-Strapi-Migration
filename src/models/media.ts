// src/models/media.ts

export class MediaModel {
  id: number | string;
  url: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string;
  localPath?: string;

  constructor(data: Partial<MediaModel> = {}) {
    this.id = data.id || '';
    this.url = data.url || '';
    this.filename = data.filename || '';
    this.mimeType = data.mimeType || '';
    this.filesize = data.filesize || 0;
    this.width = data.width || null;
    this.height = data.height || null;
    this.altText = data.altText || '';
    this.caption = data.caption || '';
    this.localPath = data.localPath;
  }
}