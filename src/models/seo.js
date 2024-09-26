class SEOModel {
    constructor(data = {}) {
      this.title = data.title || '';
      this.metaDesc = data.metaDesc || '';
      this.focusKeyword = data.focusKeyword || '';
      this.metaKeywords = data.metaKeywords || '';
      this.metaRobotsNoindex = data.metaRobotsNoindex || '';
      this.metaRobotsNofollow = data.metaRobotsNofollow || '';
      this.opengraphTitle = data.opengraphTitle || '';
      this.opengraphDescription = data.opengraphDescription || '';
      this.opengraphImage = data.opengraphImage || '';
      this.twitterTitle = data.twitterTitle || '';
      this.twitterDescription = data.twitterDescription || '';
      this.twitterImage = data.twitterImage || '';
      this.canonical = data.canonical || '';
      this.schema = data.schema || {};
    }
  }
  
  module.exports = { SEOModel };