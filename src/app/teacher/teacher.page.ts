import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from  '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-maestro',
  templateUrl: './teacher.page.html',
  styleUrls: ['./teacher.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})

export class TeacherPage implements OnInit {

  constructor(private router: Router, private authService: AuthService) {
    addIcons({logOutOutline});
  }

  ngOnInit() {
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
