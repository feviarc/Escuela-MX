import { Routes } from '@angular/router';
import { validSchoolGuard } from './guards/valid-school-guard';
import { AuthGuard } from './guards/auth.guard';

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
    loadComponent: () => import('./auth/auth.page').then( m => m.AuthPage),
    canActivate: [validSchoolGuard]
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage),
    canActivate: [AuthGuard],
    data: {expectedRole: 'administrador'}
  },
  {
    path: 'teacher-dashboard',
    loadComponent: () => import('./teacher/teacher.page').then( m => m.TeacherPage),
    canActivate: [AuthGuard],
    data: {expectedRole: 'maestro'}
  },
  {
    path: 'caregiver-dashboard',
    loadComponent: () => import('./caregiver/caregiver.page').then( m => m.CaregiverPage),
    canActivate: [AuthGuard],
    data: {expectedRole: 'padre'}
  },
  {
    path: '**',
    redirectTo: 'portal'
  }
];
