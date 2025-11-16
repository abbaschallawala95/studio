'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';

let app: App;
/**
 * Initializes the server-side Firebase app instance, ensuring it's a singleton.
 */
export async function initializeServerApp() {
  if (!getApps().length) {
    app = initializeApp();
  } else {
    app = getApps()[0];
  }
  return app;
}
