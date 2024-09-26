function mapToJamstack(intermediateContent) {
    return intermediateContent.map(item => {
      return {
        frontmatter: {
          title: item.title,
          date: item.createdAt,
          author: item.author,
          slug: item.slug,
          categories: item.categories,
          tags: item.tags,
          featured_image: item.featuredImage ? {
            src: item.featuredImage.url,
            alt: item.featuredImage.altText
          } : null,
          seo: {
            title: item.seo.metaTitle,
            description: item.seo.metaDescription,
            canonicalUrl: item.seo.canonicalURL,
            focusKeyword: item.seo.focusKeyword,
            openGraph: {
              title: item.seo.openGraph.title,
              description: item.seo.openGraph.description
            },
            twitter: {
              title: item.seo.twitterCard.title,
              description: item.seo.twitterCard.description
            }
          }
        },
        content: item.body
      };
    });
  }
  
  module.exports = { mapToJamstack };
  