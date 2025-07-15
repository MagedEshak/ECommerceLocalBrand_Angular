import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';



export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const cookieService = inject(CookieService);


  const token = cookieService.get('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
