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
    path: 'auth',
    loadComponent: () => import('./auth/auth.page').then( m => m.AuthPage)
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage)
  },
  {
    path: 'teacher-dashboard',
    loadComponent: () => import('./teacher/teacher.page').then( m => m.TeacherPage)
  },
  {
    path: 'caregiver-dashboard',
    loadComponent: () => import('./caregiver/caregiver.page').then( m => m.CaregiverPage)
  },
  {
    path: '**',
    redirectTo: 'portal'
  }
];
