// src/utils/seo-analyzer.ts

import { ContentModel } from '../models/content';

interface SEOScore {
  titleLength: number;
  descriptionLength: number;
  keywordDensity: number;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasSchema: boolean;
}

/**
 * Analyzes SEO aspects of a content item.
 * @param content - The content item to analyze.
 * @returns An object containing SEO scores.
 */
export function analyzeSEO(content: ContentModel): SEOScore {
  const seoScore: SEOScore = {
    titleLength: 0,
    descriptionLength: 0,
    keywordDensity: 0,
    hasOpenGraph: false,
    hasTwitterCard: false,
    hasSchema: false,
  };

  if (content.title) {
    seoScore.titleLength = content.title.length;
  }

  if (content.body) {
    const bodyContent = content.body;
    const wordCount = bodyContent.split(/\s+/).length;

    if (content.seo.focusKeyword) {
      const keywordCount =
        (bodyContent.toLowerCase().match(new RegExp(content.seo.focusKeyword.toLowerCase(), 'g')) ||
          []).length;
      seoScore.keywordDensity = (keywordCount / wordCount) * 100;
    }

    seoScore.hasOpenGraph = !!content.seo.opengraphTitle || !!content.seo.opengraphDescription;
    seoScore.hasTwitterCard = !!content.seo.twitterTitle || !!content.seo.twitterDescription;
    seoScore.hasSchema = Object.keys(content.seo.schema).length > 0;
  }

  return seoScore;
}