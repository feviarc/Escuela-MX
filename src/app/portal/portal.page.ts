import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonInputOtp,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { schoolOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';
import { SchoolService } from '../services/school.service';


@Component({
  selector: 'app-portal',
  templateUrl: './portal.page.html',
  styleUrls: ['./portal.page.scss'],
  standalone: true,
  imports: [IonLabel,
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonIcon,
    IonImg,
    IonInput,
    IonInputOtp,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToast,
  ]
})

export class PortalPage implements OnInit {

  cct = '';
  pin = '';
  isToastOpen = false;
  toastMessage = '🛑 La clave o el PIN son incorrectos.';

  constructor(
    private router: Router,
    private authService: AuthService,
    private schoolService: SchoolService,
    private userProfileService: UserProfileService
  ) {
    addIcons({schoolOutline});
  }

  async ngOnInit() {
    await this.checkUserStatus();
  }

  private async checkUserStatus() {
    try {
      const user = await firstValueFrom(this.authService.getCurrentUser());

      if(user) {
        const profile = await firstValueFrom(this.userProfileService.getUserProfile(user.uid));

        if(profile){
          switch(profile.rol) {
            case 'administrador':
              this.router.navigateByUrl('/admin-dashboard');
              break;
            case 'maestro':
              this.router.navigateByUrl('/teacher-dashboard');
              break;
            case 'tutor':
              this.router.navigateByUrl('/caregiver-dashboard');
              break;
            default:
              this.router.navigateByUrl('/portal');
          }
        }
      }
    } catch(error) {
      console.log('Error en la verificación de usuario: ', error);
    }
  }

  isInvalidForm() {
    return this.cct.length !== 10 || (this.pin === null || ('' + this.pin).length !== 4);
  }

   async onContinue() {

    const isValid = await this.schoolService.validateCredentials(this.cct.toUpperCase(), this.pin);

    if(isValid) {
      this.router.navigateByUrl('/auth');
    } else {
      this.setOpenToast(true);
    }

    this.cct = '';
    this.pin = '';

  }

  setOpenToast(openStatus: boolean) {
    this.isToastOpen = openStatus;
  }
}
