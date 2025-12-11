/**
 * useContractorSearchSeo composable
 *
 * Provides SEO meta tags and Schema.org structured data for contractor search pages.
 * Handles dynamic titles based on active filters and location context.
 */

import { computed, type Ref } from 'vue'

export interface ContractorSearchSeoOptions {
  /** Total number of contractors in results */
  totalContractors: Ref<number>
  /** Active service type filter (slug) */
  serviceType?: Ref<string | null>
  /** Active rating filter */
  minRating?: Ref<number | null>
  /** State name if filtering by state */
  stateName?: string
  /** State abbreviation if filtering by state */
  stateCode?: string
  /** City name if filtering by city */
  cityName?: string
}

export function useContractorSearchSeo(options: ContractorSearchSeoOptions) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://costofconcrete.com'
  const siteName = config.public.siteName || 'Cost of Concrete'

  // Build dynamic page title based on context
  const pageTitle = computed(() => {
    if (options.cityName && options.stateName) {
      return `Concrete Contractors in ${options.cityName}, ${options.stateCode} | ${siteName}`
    }
    if (options.stateName) {
      return `Concrete Contractors in ${options.stateName} | ${siteName}`
    }
    return `Find Concrete Contractors Near You | ${siteName}`
  })

  // Build dynamic description based on context
  const pageDescription = computed(() => {
    const count = options.totalContractors.value
    
    if (options.cityName && options.stateName) {
      return `Browse ${count}+ verified concrete contractors in ${options.cityName}, ${options.stateCode}. Compare ratings, read reviews, and get quotes for driveways, patios, foundations and more.`
    }
    if (options.stateName) {
      return `Find ${count}+ top-rated concrete contractors across ${options.stateName}. Compare services, read reviews, and get free quotes for your concrete project.`
    }
    return `Search and compare ${count}+ top-rated concrete contractors across the United States. Get quotes for driveways, patios, foundations, stamped concrete, and more.`
  })

  // Canonical URL
  const canonicalUrl = computed(() => {
    if (options.cityName && options.stateCode) {
      const stateSlug = options.stateCode.toLowerCase()
      const citySlug = options.cityName.toLowerCase().replace(/\s+/g, '-')
      return `${siteUrl}/${stateSlug}/${citySlug}/concrete-contractors/`
    }
    if (options.stateCode) {
      return `${siteUrl}/${options.stateCode.toLowerCase()}/`
    }
    return `${siteUrl}/concrete-contractors/`
  })

  // Schema.org WebPage structured data
  const schemaOrgWebPage = computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle.value,
    description: pageDescription.value,
    url: canonicalUrl.value,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/concrete-contractors/?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    // Future: Featured contractors monetization
    // TODO: Add 'mainEntity' with ItemList of featured/sponsored contractors
  }))

  // Apply SEO meta tags
  function applySeoMeta() {
    useSeoMeta({
      title: pageTitle.value,
      description: pageDescription.value,
      ogTitle: pageTitle.value.replace(` | ${siteName}`, ''),
      ogDescription: pageDescription.value,
      ogType: 'website',
      ogUrl: canonicalUrl.value,
      ogSiteName: siteName,
      ogLocale: 'en_US',
      twitterCard: 'summary',
      twitterTitle: pageTitle.value.replace(` | ${siteName}`, ''),
      twitterDescription: pageDescription.value
    })

    useHead({
      title: pageTitle.value,
      link: [{ rel: 'canonical', href: canonicalUrl.value }],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schemaOrgWebPage.value)
        }
      ]
    })
  }

  return {
    pageTitle,
    pageDescription,
    canonicalUrl,
    schemaOrgWebPage,
    applySeoMeta,
    siteName,
    siteUrl
  }
}

