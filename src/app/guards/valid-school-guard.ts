import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SchoolService } from '../services/school.service';
import { firstValueFrom } from 'rxjs';


export const validSchoolGuard: CanActivateFn = async (route, state) => {

  const router = inject(Router);
  const authService = inject(AuthService);
  const escuelaService = inject(SchoolService);

  try {
    const user = await firstValueFrom(authService.getCurrentUser());
    if(user) {
      return true;
    }
  } catch(error) {
    console.log('Error en la autenticación del usuario', error);
  }

  if(escuelaService.getValidationStatus()) {
    return true;
  }

  console.log('Acceso denegado.');
  return router.createUrlTree(['/portal']);
};
