import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonProgressBar,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/angular/standalone";

import { OverlayEventDetail } from '@ionic/core/components';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-tab-contact',
  templateUrl: './tab-contact.component.html',
  styleUrls: ['./tab-contact.component.scss'],
  standalone: true,
  imports: [
    IonActionSheet,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonProgressBar,
    IonTitle,
    IonToast,
    IonToolbar,
  ]
})
export class TabContactComponent  implements OnInit {

  isLoading = true;
  toastMessage = '';
  isToastOpen = false;

  public logoutActionSheetButtons = [
    {
      text: 'Aceptar',
      role: 'accept',
      data: {
        action: 'accept',
      }
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {}

  onLogout(event: CustomEvent<OverlayEventDetail>) {
    const eventButton = event.detail.data;

    if(!eventButton || eventButton.action === 'cancel') {
      return;
    }

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
