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
    canActivateChild: [AuthGuard],
    data: {expectedRole: 'administrador'},
    children: [
      {
        path: 'tab-users',
        loadComponent: () => import('./admin/tab-users/tab-users.component').then((m) => m.TabUsersComponent)
      },
      {
        path: 'tab-schools',
        loadComponent: () => import('./admin/tab-schools/tab-schools.component').then((m) => m.TabSchoolsComponent)
      },
      {
        path: 'tab-classes',
        loadComponent: () => import('./admin/tab-classes/tab-classes.component').then((m) => m.TabClassesComponent)
      },
      {
        path: 'tab-courses',
        loadComponent: () => import('./admin/tab-courses/tab-courses.component').then((m) => m.TabCoursesComponent)
      },
      {
        path: 'tab-notifications',
        loadComponent: () => import('./admin/tab-notifications/tab-notifications.component').then((m) => m.TabNotificationsComponent)
      },
      {
        path: '',
        redirectTo: '/admin-dashboard/tab-users',
        pathMatch: 'full'
      }
    ]
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
    data: {expectedRole: 'tutor'}
  },
  {
    path: '**',
    redirectTo: 'portal'
  }
];
