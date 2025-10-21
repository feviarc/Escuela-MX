import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";

import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab-notifications',
  templateUrl: './tab-notifications.component.html',
  styleUrls: ['./tab-notifications.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
  ]
})

export class TabNotificationsComponent  implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({logOutOutline});
  }

  ngOnInit() {}

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
