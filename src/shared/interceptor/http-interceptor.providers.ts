import { ApiBaseUrlInterceptor } from './api/api-base-url.interceptor';
import { AuthInterceptor } from './auth/auth.interceptor';

export const httpInterceptorProviders = [ApiBaseUrlInterceptor, AuthInterceptor];
