import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from  '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonLabel,
  IonListHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';
import { CctStorageService } from '../services/cct-storage.service';
import { School, SchoolCRUDService } from '../services/school-crud.service';


@Component({
  selector: 'app-maestro',
  templateUrl: './teacher.page.html',
  styleUrls: ['./teacher.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
  ]
})

export class TeacherPage implements OnInit {

  cct = '';
  school?: School | null;

  constructor(
    private authService: AuthService,
    private cctStorageService: CctStorageService,
    private router: Router,
    private schoolCRUDService: SchoolCRUDService
  ) {}

  ngOnInit() {
    const cct = this.cctStorageService.getCCT();
    this.cct = (cct !== null ? cct : '');

    this.schoolCRUDService.getSchoolByCCT(this.cct).subscribe({
      next: school => {
        this.school = school;
      }
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/auth');
      },
      error: error => {
        console.log('Error de cierre de sesión: ', error);
      }
    });
  }
}
