import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from './../services/auth.service';


@Component({
  selector: 'app-caregiver',
  templateUrl: './caregiver.page.html',
  styleUrls: ['./caregiver.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
  ]
})

export class CaregiverPage implements OnInit {

  constructor(private authService: AuthService, private router: Router) {
    addIcons({logOutOutline});
  }

  ngOnInit() { }

  onLogout() {
    this.authService.logout().subscribe({
      next: ()=>{
        this.router.navigateByUrl('/auth');
      },
      error: error=>{
        console.log('Error de cierre de sesión');
      }
    });
  }
}
