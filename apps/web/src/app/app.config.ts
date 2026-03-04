import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { environment } from '../environments/environment';
import { API_BASE_URL } from './core/api-base-url.token';
import { apiTimeoutInterceptor } from './core/api-timeout.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiTimeoutInterceptor])),
    provideClientHydration(withEventReplay()),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  ]
};
