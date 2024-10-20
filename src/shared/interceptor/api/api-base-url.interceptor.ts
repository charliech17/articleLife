import { HttpInterceptorFn } from '@angular/common/http';

export const ApiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('api/')) {
    const apiReq = req.clone({ url: `http://localhost:8080/${req.url}` });
    return next(apiReq);
  }

  return next(req);
};
