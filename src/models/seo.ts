// src/models/seo.ts

export class SEOModel {
  title: string;
  metaDesc: string;
  focusKeyword: string;
  metaKeywords: string;
  metaRobotsNoindex: string;
  metaRobotsNofollow: string;
  opengraphTitle: string;
  opengraphDescription: string;
  opengraphImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonical: string;
  schema: Record<string, any>;

  constructor(data: Partial<SEOModel> = {}) {
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