/**
 * Composable for generating SEO meta tags for category listing pages
 * e.g., /raleigh/concrete-contractors/
 *
 * Features:
 * - Schema.org ItemList JSON-LD for contractor listings
 * - Open Graph tags
 * - Twitter Card tags
 * - Canonical URL
 * - SSR-compatible
 */

export interface CategoryListingSeoData {
  cityName: string
  citySlug: string
  stateCode: string
  stateSlug?: string // SEO-optimized state slug (e.g., 'texas' instead of 'TX')
  categoryName?: string
  categorySlug?: string
  totalContractors: number
}

export function useCategoryListingSeo(data: CategoryListingSeoData) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://costofconcrete.com'
  const siteName = config.public.siteName || 'Cost of Concrete'

  // Build canonical URL with SEO-optimized structure
  // Format: /[state]/[city]/concrete-contractors/
  const stateSlug = data.stateSlug || data.stateCode?.toLowerCase()
  const canonicalPath = stateSlug
    ? `/${stateSlug}/${data.citySlug}/concrete-contractors/`
    : `/${data.citySlug}/concrete-contractors/`
  const fullUrl = `${siteUrl}${canonicalPath}`

  // Build location string
  const locationStr = `${data.cityName}, ${data.stateCode}`

  // Generate page title
  const categoryLabel = data.categoryName || 'Concrete Contractors'
  const pageTitle = `${categoryLabel} in ${locationStr} | ${siteName}`

  // Generate description
  const pageDescription = `Find the best ${categoryLabel.toLowerCase()} in ${locationStr}. Browse ${data.totalContractors} verified contractors with ratings and reviews.`

  // Set SEO meta tags
  useSeoMeta({
    title: pageTitle,
    description: pageDescription.slice(0, 160),
    canonicalUrl: fullUrl,

    // Open Graph
    ogTitle: pageTitle,
    ogDescription: pageDescription.slice(0, 200),
    ogType: 'website',
    ogUrl: fullUrl,
    ogSiteName: siteName,
    ogLocale: 'en_US',

    // Twitter Card
    twitterCard: 'summary',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription.slice(0, 200)
  })

  // Build Schema.org LocalBusiness search action
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': fullUrl,
    name: pageTitle,
    description: pageDescription,
    url: fullUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl
    },
    about: {
      '@type': 'Service',
      name: categoryLabel,
      areaServed: {
        '@type': 'City',
        name: data.cityName,
        containedInPlace: {
          '@type': 'State',
          name: data.stateCode
        }
      }
    }
  }

  // Add to head
  useHead({
    title: pageTitle,
    link: [
      { rel: 'canonical', href: fullUrl }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(webPageSchema)
      }
    ]
  })

  return {
    pageTitle,
    pageDescription,
    canonicalUrl: fullUrl
  }
}

