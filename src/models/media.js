class MediaModel {
    constructor(data = {}) {
      this.id = data.id || '';
      this.url = data.url || '';
      this.filename = data.filename || '';
      this.mimeType = data.mimeType || '';
      this.filesize = data.filesize || 0;
      this.width = data.width || null;
      this.height = data.height || null;
      this.altText = data.altText || '';
      this.caption = data.caption || '';
    }
  }
  
  module.exports = { MediaModel };