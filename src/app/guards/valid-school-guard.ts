import { CanActivateFn } from '@angular/router';

export const validSchoolGuard: CanActivateFn = (route, state) => {
  return true;
};
