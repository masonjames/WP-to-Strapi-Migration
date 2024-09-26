const { MediaModel } = require('./media');
const { SEOModel } = require('./seo');

class ContentModel {
  constructor(data = {}) {
    // ... existing fields ...
    this.featuredImage = data.featuredImage ? new MediaModel(data.featuredImage) : null;
    this.mediaGallery = (data.mediaGallery || []).map(item => new MediaModel(item));
    this.seo = new SEOModel(data.seo);
  }
}

module.exports = { ContentModel };