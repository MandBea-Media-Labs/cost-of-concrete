// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    '@formkit/auto-animate',
    'reka-ui/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/supabase',
    '@nuxt/hints',
  ],

  supabase: {
    // Redirect configuration (set to false if you want to handle auth redirects manually)
    redirect: false,

    // Database types configuration
    types: '~/types/supabase.ts',

    // Optional: Uncomment and configure if you want automatic auth redirects
    // redirectOptions: {
    //   login: '/login',
    //   callback: '/confirm',
    //   exclude: ['/'],
    // },
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },

  $development: {
    scripts: {
      registry: {
        googleTagManager: 'mock',
      },
    },
  },

  css: [
    '~/assets/css/fonts.css',
  ],

  googleFonts: {
    families: {
      'Inter': {
        wght: [300, 400, 500, 600, 700, 800],
        ital: [300, 400, 500, 600, 700, 800],
      },
      'Inter+Tight': {
        wght: [300, 400, 500, 600, 700, 800],
        ital: [300, 400, 500, 600, 700, 800],
      },
    },
    display: 'swap',
  },

  components: [
    {
      path: '~/components/ui',
      pathPrefix: false,
    },
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  site: {
    url: process.env.NUXT_SITE_URL,
    name: process.env.NUXT_SITE_NAME,
  },

  runtimeConfig: {
    // Server-only keys (never exposed to client)
    googleGeocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY || '',
    imageAllowlist: process.env.IMAGE_ALLOWLIST || 'lh3.googleusercontent.com,streetviewpixels-pa.googleapis.com',

    public: {
      siteUrl: process.env.NUXT_SITE_URL || 'https://costofconcrete.com',
      siteName: process.env.NUXT_SITE_NAME || 'Cost of Concrete',
    },
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  robots: {
    // allow: [
    //   '*',
    // ],
    disallow: [
      '*',
      '/privacy',
      '/terms',
    ],
  },

  // sitemap: {
  //   exclude: [
  //     '/privacy',
  //     '/terms',
  //   ],
  // },
})
