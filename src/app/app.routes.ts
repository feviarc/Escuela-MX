import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: '',
    redirectTo: 'portal',
    pathMatch: 'full',
  },
    {
    path: 'portal',
    loadComponent: () => import('./portal/portal.page').then( m => m.PortalPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
];
