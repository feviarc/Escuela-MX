import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonInputOtp,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSpinner,
  IonToast,
  IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';
import { addIcons } from 'ionicons';
import { logoApple, logoAndroid, laptopOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { InstallAppService } from '../services/install-app-service';
import { UserProfileService } from '../services/user-profile.service';
import { SchoolService } from '../services/school.service';


@Component({
  selector: 'app-portal',
  templateUrl: './portal.page.html',
  styleUrls: ['./portal.page.scss'],
  standalone: true,
  imports: [IonTitle, IonButtons, IonLabel,
    CommonModule,
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput,
    IonInputOtp,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonSpinner,
    IonToast,
    IonToolbar
  ]
})

export class PortalPage implements OnInit {

  @ViewChild(IonModal) modal!: IonModal;

  cct = '';
  pin = '';
  detectedOS = '';
  isIOS = false;
  isLoading = true;
  isToastOpen = false;
  toastMessage = '🛑 La clave o el PIN son incorrectos.';


  constructor(
    private router: Router,
    private authService: AuthService,
    public installAppService: InstallAppService,
    private schoolService: SchoolService,
    private userProfileService: UserProfileService
  ) {
    addIcons({laptopOutline, logoAndroid, logoApple});
  }

  async ngOnInit() {
    await this.checkUserStatus();
    this.detectedOS =  this.getOperatingSystem();
    this.isIOS = this.detectedOS === 'logo-apple' ? true : false;

    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
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

  get isStandalone() {
    const androidMatchMedia = window.matchMedia('(display-mode: standalone)').matches;
    const iOSMatchMedia = (window.navigator as any).standalone;
    return ( androidMatchMedia || iOSMatchMedia  === true);
  }

  onCloseModal() {
    this.modal.dismiss(null, 'cancel');
  }

  getOperatingSystem() {
    const userAgent = navigator.userAgent;

    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'logo-apple';
    if (/Android/i.test(userAgent)) return 'logo-android';

    return 'laptop-outline';
  }

  isInvalidForm() {
    return this.cct.length !== 10 || (this.pin === null || ('' + this.pin).length !== 4);
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event) {
    event.preventDefault();
    this.installAppService.promptStatus = event;
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

  showInstallAppBanner() {
    this.installAppService.showInstallAppBanner();
  }
}
