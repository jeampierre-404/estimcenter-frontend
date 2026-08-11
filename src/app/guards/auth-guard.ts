import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const isLogged = localStorage.getItem('clienteLogueado');

  if (isLogged === 'true') {
    return true; 
  } else {
    alert('Acceso denegado. Por favor, inicia sesión para poder cotizar.');
    router.navigate(['/login']);
    return false; 
  }
};