import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable, map, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';


@Injectable({providedIn: 'root'})

export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    const expectedRole = route.data['expectedRole'];

    return this.authService.getCurrentUser().pipe(
      switchMap(user => {

        if(!user) {
          return of(this.router.createUrlTree(['/portal']));
        }

        return this.userProfileService.getUserProfile(user.uid).pipe(
          map(profile => {
            if(profile && profile.rol === expectedRole) {
              return true;
            } else {
              return this.router.createUrlTree(['/portal']);
            }
          })
        );
      })
    );
  }
}
