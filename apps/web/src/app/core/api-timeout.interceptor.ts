import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { timeout } from 'rxjs';
import { API_BASE_URL } from './api-base-url.token';

const API_TIMEOUT_MS = 60_000;

export const apiTimeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = inject(API_BASE_URL);
  const url = req.url;
  if (!url.startsWith(baseUrl)) return next(req);
  return next(req).pipe(timeout(API_TIMEOUT_MS));
};
