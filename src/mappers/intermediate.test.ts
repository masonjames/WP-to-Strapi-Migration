// tests/mappers/intermediate.test.ts

import { mapToIntermediate } from '../../src/mappers/intermediate';
import { ContentModel } from '../../src/models/content';

describe('mapToIntermediate', () => {
  it('should map WordPress data to intermediate format', () => {
    const sourceData = [
      {
        id: 1,
        title: { rendered: 'Test Post' },
        content: { rendered: '<p>Content</p>' },
        slug: 'test-post',
        date: '2021-01-01',
        modified: '2021-01-02',
        type: 'post',
        categories: [1],
        tags: [1],
        acf: { custom_field: 'value' },
        yoast_seo: {
          title: 'SEO Title',
          metadesc: 'SEO Description',
        },
        _embedded: {
          'wp:featuredmedia': [
            {
              id: 10,
              source_url: 'https://example.com/image.jpg',
              alt_text: 'Alt Text',
              caption: { rendered: 'Caption' },
              media_details: {
                file: 'image.jpg',
                width: 800,
                height: 600,
              },
              mime_type: 'image/jpeg',
            },
          ],
        },
      },
    ];

    const result = mapToIntermediate(sourceData, 'WordPress');
    expect(result).toHaveLength(1);
    const contentItem: ContentModel = result[0];
    expect(contentItem.title).toBe('Test Post');
    expect(contentItem.seo.title).toBe('SEO Title');
  });
});