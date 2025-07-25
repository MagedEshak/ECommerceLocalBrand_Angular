// src/app/interceptors/spinner.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { delay, finalize } from 'rxjs/operators';
import { SpinnerService } from '../../services/SpinnerService/spinner-service';
export const spinnerInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const spinner = inject(SpinnerService);
  spinner.show();

  return next(req).pipe(
    delay(500), // Optional: Add a delay to simulate loading time
    finalize(() => spinner.hide())
  );
};
