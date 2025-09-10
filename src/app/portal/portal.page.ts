import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { schoolOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
// import { AuthService } from '../services/auth.service';
// import { UserProfileService } from '../services/user-profile.service';
// import { EscuelaService } from '../services/escuela.service';


@Component({
  selector: 'app-portal',
  templateUrl: './portal.page.html',
  styleUrls: ['./portal.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})

export class PortalPage implements OnInit {

  cct = '';
  pin = '';

  constructor(
    // private router: Router,
    // private authService: AuthService,
    // private escuelaService: EscuelaService,
    // private userProfileService: UserProfileService
  ) {
    addIcons({schoolOutline});
  }

  async ngOnInit() {
    await this.checkUserStatus();
  }

  private async checkUserStatus() {
    // try {
    //   const user = await firstValueFrom(this.authService.getCurrentUser());

    //   if(user) {
    //     const profile = await firstValueFrom(this.userProfileService.getUserProfile(user.uid));

    //     if(profile){
    //       switch(profile.rol) {
    //         case 'administrador':
    //           this.router.navigateByUrl('/admin-dashboard');
    //           break;
    //         case 'maestro':
    //           this.router.navigateByUrl('/maestro-dashboard');
    //           break;
    //         case 'padre':
    //           this.router.navigateByUrl('/padre-dashboard');
    //           break;
    //         default:
    //           this.router.navigateByUrl('/portal');
    //       }
    //     }
    //   }
    // } catch(error) {
    //   console.log('Error en la verificación de usuario: ', error);
    // }
  }

  async onContinue() {

    // console.log('PIN: ', this.pin);

    // if(!this.cct || !this.pin) {
    //   console.error('La CCT y el PIN son obligatorios.');
    //   return;
    // }

    // const isValid = await this.escuelaService.validateCredentials(this.cct.toUpperCase(), this.pin);

    // if(isValid) {
    //   this.router.navigateByUrl('/auth');
    // } else {
    //   console.error('CCT o PIN incorrectos.');
    // }
  }
}
