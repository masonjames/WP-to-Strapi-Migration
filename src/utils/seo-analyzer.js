function analyzeSEO(content) {
  const seoScore = {
    titleLength: 0,
    descriptionLength: 0,
    keywordDensity: 0,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchema: false
  };

  if (content.seo) {
    seoScore.titleLength = content.seo.title ? content.seo.title.length : 0;
    seoScore.descriptionLength = content.seo.metaDesc ? content.seo.metaDesc.length : 0;

    if (content.seo.focusKeyword && content.body) {
      const keywordCount = (content.body.toLowerCase().match(new RegExp(content.seo.focusKeyword.toLowerCase(), 'g')) || []).length;
      const wordCount = content.body.split(/\s+/).length;
      seoScore.keywordDensity = (keywordCount / wordCount) * 100;
    }

    seoScore.hasOpenGraph = !!(content.seo.opengraphTitle || content.seo.opengraphDescription || content.seo.opengraphImage);
    seoScore.hasTwitterCard = !!(content.seo.twitterTitle || content.seo.twitterDescription || content.seo.twitterImage);
    seoScore.hasSchema = Object.keys(content.seo.schema || {}).length > 0;
  }

  return seoScore;
}

module.exports = { analyzeSEO };