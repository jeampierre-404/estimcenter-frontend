import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const isAdminLogged = localStorage.getItem('adminLogueado');

  if (isAdminLogged === 'true') {
    return true; 
  } else {
    alert('Acceso denegado. Área exclusiva para personal corporativo.');
    router.navigate(['/admin/login']);
    return false; 
  }
};