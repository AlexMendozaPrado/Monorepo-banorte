import { PlatformType } from '@/core/domain/value-objects/PlatformType';

/**
 * Configuración de selectores para scraping por plataforma
 */
export interface PlatformScrapingConfig {
  url: string;
  selectors: {
    version: string;
    releaseDate?: string;
    changelog?: string;
  };
  versionPattern?: RegExp;
  headers?: Record<string, string>;
}

/**
 * Configuración completa de scraping para un servicio
 */
export interface ScrapingConfig {
  serviceId: string;
  name: string;
  platforms: {
    [K in PlatformType]?: PlatformScrapingConfig;
  };
  rateLimit: number; // ms entre requests
  timeout: number; // ms
  retries: number;
}

/**
 * Configuraciones de scraping para cada servicio
 */
export const scrapingConfigs: ScrapingConfig[] = [
  {
    serviceId: 'incode',
    name: 'Incode',
    platforms: {
      web: {
        url: 'https://docs.incode.com/docs/web-sdk/changelog',
        selectors: {
          version: 'h2:first-of-type, .version-header, [data-version]',
          releaseDate: '.release-date, time',
          changelog: '.changelog-content, .release-notes',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
      ios: {
        url: 'https://docs.incode.com/docs/ios-sdk/changelog',
        selectors: {
          version: 'h2:first-of-type, .version-header',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
      android: {
        url: 'https://docs.incode.com/docs/android-sdk/changelog',
        selectors: {
          version: 'h2:first-of-type, .version-header',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
    },
    rateLimit: 1000,
    timeout: 10000,
    retries: 3,
  },
  {
    serviceId: 'firebase',
    name: 'Firebase',
    platforms: {
      web: {
        url: 'https://firebase.google.com/support/release-notes/js',
        selectors: {
          version: 'h2.devsite-heading, h2[id^="version"]',
          changelog: '.devsite-article-body > ul:first-of-type',
        },
        versionPattern: /Version\s*(\d+\.\d+\.\d+)/i,
      },
      ios: {
        url: 'https://firebase.google.com/support/release-notes/ios',
        selectors: {
          version: 'h2.devsite-heading, h2[id^="version"]',
        },
        versionPattern: /(\d+\.\d+\.\d+)/,
      },
      android: {
        url: 'https://firebase.google.com/support/release-notes/android',
        selectors: {
          version: 'h2.devsite-heading, h2[id^="version"]',
        },
        versionPattern: /(\d+\.\d+\.\d+)/,
      },
    },
    rateLimit: 2000,
    timeout: 15000,
    retries: 2,
  },
  {
    serviceId: 'segment',
    name: 'Segment',
    platforms: {
      web: {
        url: 'https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/changelog/',
        selectors: {
          version: 'h2, h3.changelog-version',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
      ios: {
        url: 'https://segment.com/docs/connections/sources/catalog/libraries/mobile/ios/changelog/',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
      android: {
        url: 'https://segment.com/docs/connections/sources/catalog/libraries/mobile/android/changelog/',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
    },
    rateLimit: 1500,
    timeout: 12000,
    retries: 2,
  },
  {
    serviceId: 'appsflyer',
    name: 'AppsFlyer',
    platforms: {
      ios: {
        url: 'https://dev.appsflyer.com/hc/docs/ios-sdk-release-notes',
        selectors: {
          version: 'h2, h3, .version-title',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
      android: {
        url: 'https://dev.appsflyer.com/hc/docs/android-sdk-release-notes',
        selectors: {
          version: 'h2, h3, .version-title',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
    },
    rateLimit: 1500,
    timeout: 12000,
    retries: 2,
  },
  {
    serviceId: 'dynatrace',
    name: 'Dynatrace',
    platforms: {
      web: {
        url: 'https://www.dynatrace.com/support/help/platform-modules/digital-experience/web-applications/initial-setup/rum-injection',
        selectors: {
          version: '.version, h2, h3',
        },
        versionPattern: /(\d+\.\d+\.\d+)/,
      },
      ios: {
        url: 'https://www.dynatrace.com/support/help/platform-modules/digital-experience/mobile-applications/setup-and-configuration/ios/',
        selectors: {
          version: '.version, h2, h3',
        },
        versionPattern: /(\d+\.\d+\.\d+)/,
      },
      android: {
        url: 'https://www.dynatrace.com/support/help/platform-modules/digital-experience/mobile-applications/setup-and-configuration/android/',
        selectors: {
          version: '.version, h2, h3',
        },
        versionPattern: /(\d+\.\d+\.\d+)/,
      },
    },
    rateLimit: 2000,
    timeout: 15000,
    retries: 2,
  },
  {
    serviceId: 'stripe',
    name: 'Stripe',
    platforms: {
      web: {
        url: 'https://github.com/stripe/stripe-js/blob/master/CHANGELOG.md',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /\[?v?(\d+\.\d+\.\d+)\]?/,
      },
      ios: {
        url: 'https://github.com/stripe/stripe-ios/blob/master/CHANGELOG.md',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /\[?v?(\d+\.\d+\.\d+)\]?/,
      },
      android: {
        url: 'https://github.com/stripe/stripe-android/blob/master/CHANGELOG.md',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /\[?v?(\d+\.\d+\.\d+)\]?/,
      },
    },
    rateLimit: 1000,
    timeout: 10000,
    retries: 3,
  },
  {
    serviceId: 'braze',
    name: 'Braze',
    platforms: {
      web: {
        url: 'https://www.braze.com/docs/developer_guide/platform_integration_guides/web/changelog/',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
      ios: {
        url: 'https://www.braze.com/docs/developer_guide/platform_integration_guides/swift/changelog/',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
      android: {
        url: 'https://www.braze.com/docs/developer_guide/platform_integration_guides/android/changelog/',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /v?(\d+\.\d+\.\d+)/,
      },
    },
    rateLimit: 1500,
    timeout: 12000,
    retries: 2,
  },
  {
    serviceId: 'contentful',
    name: 'Contentful',
    platforms: {
      web: {
        url: 'https://github.com/contentful/contentful.js/blob/master/CHANGELOG.md',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /\[?v?(\d+\.\d+\.\d+)\]?/,
      },
      ios: {
        url: 'https://github.com/contentful/contentful.swift/blob/master/CHANGELOG.md',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /\[?v?(\d+\.\d+\.\d+)\]?/,
      },
      android: {
        url: 'https://github.com/contentful/contentful.java/blob/master/CHANGELOG.md',
        selectors: {
          version: 'h2, h3',
        },
        versionPattern: /\[?v?(\d+\.\d+\.\d+)\]?/,
      },
    },
    rateLimit: 1000,
    timeout: 10000,
    retries: 3,
  },
];

/**
 * Obtiene la configuración de scraping por ID de servicio
 */
export function getScrapingConfig(serviceId: string): ScrapingConfig | undefined {
  return scrapingConfigs.find(config => config.serviceId === serviceId);
}

/**
 * Obtiene todos los IDs de servicios con configuración de scraping
 */
export function getConfiguredServiceIds(): string[] {
  return scrapingConfigs.map(config => config.serviceId);
}
