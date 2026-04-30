import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3006',
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 30000,
    responseTimeout: 30000,

    /**
     * Apuntamos `fixturesFolder` a los bundles canónicos que ya viven en
     * `__tests__/fixtures/` para evitar duplicar archivos. Los specs
     * referencian las rutas vía `cypress/fixtures/scenarios/<bundle>`.
     */
    fixturesFolder: '__tests__/fixtures',

    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
});
