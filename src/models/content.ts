// src/models/content.ts

import { MediaModel } from './media';
import { SEOModel } from './seo';

export class ContentModel {
  id: number | string;
  title: string;
  body: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  postType: string;
  categories: any[];
  tags: any[];
  customFields: Record<string, any>;
  featuredImage: MediaModel | null;
  mediaGallery: MediaModel[];
  seo: SEOModel;
  author: string;

  constructor(data: Partial<ContentModel> = {}) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.body = data.body || '';
    this.slug = data.slug || '';
    this.createdAt = data.createdAt || '';
    this.updatedAt = data.updatedAt || '';
    this.postType = data.postType || '';
    this.categories = data.categories || [];
    this.tags = data.tags || [];
    this.customFields = data.customFields || {};
    this.featuredImage = data.featuredImage ? new MediaModel(data.featuredImage) : null;
    this.mediaGallery = (data.mediaGallery || []).map((item) => new MediaModel(item));
    this.seo = new SEOModel(data.seo);
    this.author = data.author || '';
  }
}