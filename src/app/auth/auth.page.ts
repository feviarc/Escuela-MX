import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})

export class AuthPage implements OnInit {

  authForm!: FormGroup;
  isLoginMode = true;
  isResetPasswordMode = false;
  emailVerificationMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private userProfileService: UserProfileService
  ) { }

  async ngOnInit() {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    await this.checkUserStatus();
  }

  private async checkUserStatus() {
    try {
      const user = await firstValueFrom(this.authService.getCurrentUser());

      if(user) {
        this.handleLoginRedirect(user);
      }
    } catch(error) {
      console.error('Error de verificación de usuario: ', error)
    }
  }

  async onSubmit() {

    if (!this.authForm.valid) {
      return;
    }

    const isFirstUser = await this.userProfileService.isFirstUser();
    const { email, password, isPadre } = this.authForm.value;

    try {
      if(this.isLoginMode) {
        const userCredential = await firstValueFrom(this.authService.login(email, password));
        this.handleLoginRedirect(userCredential.user);

      } else if(this.isResetPasswordMode) {
        await firstValueFrom(this.authService.resetPassword(email));
        console.log('Correo de reseteo enviado');
        // Informar al usuario que un correo ha sido enviado, puede ser un toast.
        this.isResetPasswordMode = false;
        this.isLoginMode = true;

      } else {
        let role = 'maestro';
        const user = await this.authService.register(email, password);

        if(isPadre){
          role = 'padre';
        } else if(isFirstUser) {
          role = 'administrador';
        }

        await this.userProfileService.createUserProfile({
          uid: user.uid,
          email: user.email!,
          rol: role,
          nombre: ''
        });

        this.emailVerificationMessage = `¡Gracias por registrarte! Se ha enviado un correo de verificación a ${user.email}.`;
        this.isLoginMode = true;
        this.authForm.reset();
      }
    } catch(error) {
      console.log('Error de Autenticación:', error);
      this.emailVerificationMessage = 'No se pudo completar el registro, por favor, intenta de nuevo.';
    }
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.isResetPasswordMode = false;
    this.emailVerificationMessage = null;
    this.updateFormControls();
  }

  onSwitchToResetPassword() {
    this.isResetPasswordMode = true;
    this.isLoginMode = false;
    this.emailVerificationMessage = null;
    this.authForm.get('password')?.setValidators(null);
    this.authForm.get('password')?.updateValueAndValidity();
  }

  private async handleLoginRedirect(user: User) {

    if(!user) {
      this.router.navigateByUrl('/auth');
      return;
    }

    console.log('emailVerified: ', user.emailVerified);

    if(!user.emailVerified) {
      this.emailVerificationMessage = 'Tu correo electrónico no ha sido verificado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.';
      await firstValueFrom(this.authService.logout());
      return;
    }

    try {
      const userProfile = await firstValueFrom(this.userProfileService.getUserProfile(user.uid));

      if(userProfile) {
        switch(userProfile.rol) {
          case 'administrador':
            this.router.navigateByUrl('/admin-dashboard');
            break;
          case 'maestro':
            this.router.navigateByUrl('/teacher-dashboard');
            break;
          case 'padre':
            this.router.navigateByUrl('/caregiver-dashboard');
            break;
          default:
            this.router.navigateByUrl('/auth');
        }
      } else {
          await firstValueFrom(this.authService.logout());
          this.router.navigateByUrl('/auth');
      }
    } catch(error) {
      console.log('Error de perfil: ', error);
      await firstValueFrom(this.authService.logout());
      this.router.navigateByUrl('/auth');
    }
  }

  private updateFormControls() {
    const isPadreControl = this.authForm.get('isPadre');
    if(!this.isLoginMode) {
      if(!isPadreControl) {
        this.authForm.addControl('isPadre', this.formBuilder.control(false));
      }
    } else {
      this.authForm.removeControl('isPadre');
    }
  }
}
