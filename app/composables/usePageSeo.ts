import type { Database } from '~/types/supabase'

type Page = Database['public']['Tables']['pages']['Row']

/**
 * Composable for generating SEO meta tags from page data
 * 
 * Features:
 * - Generates all SEO meta tags using useHead() and useSeoMeta()
 * - Supports Schema.org JSON-LD from database metadata
 * - Supports Open Graph tags from database metadata
 * - Supports Twitter Card tags from database metadata
 * - Falls back to basic page fields if metadata not present
 * - SSR-compatible
 * 
 * @param page - Page object from database
 * 
 * @example
 * ```ts
 * const { data: page } = await useFetch('/api/pages/by-path', { query: { path } })
 * usePageSeo(page.value)
 * ```
 */
export function usePageSeo(page: Page) {
  // Get site config from runtime config
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://costofconcrete.com'
  const siteName = config.public.siteName || 'Cost of Concrete'

  // Extract SEO metadata from JSONB field
  const seoMetadata = (page.metadata as any)?.seo || {}
  const ogMetadata = seoMetadata.og || {}
  const twitterMetadata = seoMetadata.twitter || {}
  const schemaMetadata = seoMetadata.schema

  // Generate full URL for canonical and OG
  const fullUrl = page.canonical_url 
    ? `${siteUrl}${page.canonical_url}`
    : `${siteUrl}${page.full_path}`

  // Set basic SEO meta tags
  useSeoMeta({
    // Basic meta tags
    title: page.meta_title || page.title,
    description: page.description || undefined,
    keywords: page.meta_keywords?.join(', ') || undefined,
    robots: page.meta_robots?.join(', ') || undefined,

    // Canonical URL
    canonicalUrl: fullUrl,

    // Open Graph tags
    ogTitle: ogMetadata.title || page.meta_title || page.title,
    ogDescription: ogMetadata.description || page.description || undefined,
    ogType: ogMetadata.type || (page.depth === 0 ? 'website' : 'article'),
    ogUrl: ogMetadata.url || fullUrl,
    ogSiteName: ogMetadata.site_name || siteName,
    ogLocale: ogMetadata.locale || 'en_US',
    ogImage: ogMetadata.image?.url || page.og_image || undefined,
    ogImageWidth: ogMetadata.image?.width || undefined,
    ogImageHeight: ogMetadata.image?.height || undefined,
    ogImageAlt: ogMetadata.image?.alt || page.title,

    // Twitter Card tags
    twitterCard: twitterMetadata.card || 'summary_large_image',
    twitterSite: twitterMetadata.site || undefined,
    twitterCreator: twitterMetadata.creator || undefined,
    twitterTitle: twitterMetadata.title || page.meta_title || page.title,
    twitterDescription: twitterMetadata.description || page.description || undefined,
    twitterImage: twitterMetadata.image || page.og_image || undefined,
    twitterImageAlt: twitterMetadata.image_alt || page.title,

    // Article-specific tags (if applicable)
    ...(page.depth > 0 && page.published_at ? {
      articlePublishedTime: page.published_at,
      articleModifiedTime: page.updated_at,
      articleAuthor: ogMetadata.article?.author || undefined,
      articleSection: ogMetadata.article?.section || undefined,
      articleTag: ogMetadata.article?.tags || undefined,
    } : {})
  })

  // Add Schema.org JSON-LD if present in metadata
  if (schemaMetadata) {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(schemaMetadata)
        }
      ]
    })
  }

  // Add breadcrumb schema if depth > 0
  // This will be enhanced when we have breadcrumbs data
  if (page.depth > 0) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': page.title,
          'item': fullUrl
        }
      ]
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(breadcrumbSchema)
        }
      ]
    })
  }
}

