function analyzeSEO(content) {
  const seoScore = {
    titleLength: 0,
    descriptionLength: 0,
    keywordDensity: 0,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchema: false
  };

  if (content.title) {
    seoScore.titleLength = content.title.rendered ? content.title.rendered.length : content.title.length;
  }

  if (content.excerpt && content.excerpt.rendered) {
    seoScore.descriptionLength = content.excerpt.rendered.length;
  }

  if (content.content && content.content.rendered) {
    const bodyContent = content.content.rendered;
    const wordCount = bodyContent.split(/\s+/).length;

    if (content.yoast_seo && content.yoast_seo.focuskw) {
      const keywordCount = (bodyContent.toLowerCase().match(new RegExp(content.yoast_seo.focuskw.toLowerCase(), 'g')) || []).length;
      seoScore.keywordDensity = (keywordCount / wordCount) * 100;
    }

    seoScore.hasOpenGraph = bodyContent.includes('og:') || (content.yoast_seo && (content.yoast_seo.opengraph_title || content.yoast_seo.opengraph_description || content.yoast_seo.opengraph_image));
    seoScore.hasTwitterCard = bodyContent.includes('twitter:') || (content.yoast_seo && (content.yoast_seo.twitter_title || content.yoast_seo.twitter_description || content.yoast_seo.twitter_image));
    seoScore.hasSchema = bodyContent.includes('schema.org') || (content.yoast_seo && content.yoast_seo.schema && Object.keys(content.yoast_seo.schema).length > 0);
  }

  return seoScore;
}

module.exports = { analyzeSEO };