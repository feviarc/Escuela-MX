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
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.page').then( m => m.AuthPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage)
  },
  {
    path: 'teacher',
    loadComponent: () => import('./teacher/teacher.page').then( m => m.TeacherPage)
  },
  {
    path: 'caregiver',
    loadComponent: () => import('./caregiver/caregiver.page').then( m => m.CaregiverPage)
  },
];
