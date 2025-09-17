import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TeacherDataService } from '../services/teacher-data.service';
import { UserProfile } from '../models/user-profile.model';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})

export class AdminPage implements OnInit {

  teachers$!: Observable<UserProfile[]>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private teacherDataService: TeacherDataService
  ) {
    addIcons({logOutOutline});
  }

  ngOnInit() {
    this.teachers$ = this.teacherDataService.getTeachers();
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/auth');
      },
      error: error => {
        console.log('Error al cerrar sesión: ',  error);
      }
    });
  }
}
