import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { IonicModule, IonInputPasswordToggle } from '@ionic/angular';
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
  emailVerificationMessage: string | null = null;
  resetPasswordMessage: string | null = null;
  toastMessage: string | null = null;
  isLoginMode = true;
  isResetPasswordMode = false;
  isToastOpen = false;

  private messages = {
    invalidCredential: '🛑  Usuario o contraseña incorrectos.',
    emailAlreadyInUse: '🛑  Este correo ya está registrado.',
    passwordReset: '✅  Se envió un correo de restablecimiento de contraseña.',
    emailVerification: '✅  Se envió un correo de verificación. Revisa tu bandeja de entrada o Spam.',
    emailNotVerified: '⚠️  Tu correo electrónico aún no ha sido verificado. Revisa tu bandeja de entrada o la carpeta de Spam y haz clic en el enlace de verificación para activar tu cuenta.',
    default: '🛑  Ocurrió un error. Inténtalo nuevamente.'
  };

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
    const { email, password, isTutor } = this.authForm.value;

    try {
      if(this.isLoginMode) {
        const userCredential = await firstValueFrom(this.authService.login(email, password));
        this.handleLoginRedirect(userCredential.user);

      } else if(this.isResetPasswordMode) {
        await firstValueFrom(this.authService.resetPassword(email));
        this.toastMessage = this.messages.passwordReset;
        this.setOpenToast(true);
        this.isResetPasswordMode = false;
        this.isLoginMode = true;

      } else {
        let role = 'maestro';
        const user = await this.authService.register(email, password);

        if(isTutor){
          role = 'tutor';
        } else if(isFirstUser) {
          role = 'administrador';
        }

        await this.userProfileService.createUserProfile({
          uid: user.uid,
          email: user.email!,
          rol: role,
          nombre: ''
        });

        this.emailVerificationMessage = this.messages.emailVerification;
        this.isLoginMode = true;
      }

    } catch(error: any) {
      console.log(error.code);
      switch(error.code) {
        case 'auth/invalid-credential':
          this.toastMessage = this.messages.invalidCredential;
          break;
        case 'auth/email-already-in-use':
          this.toastMessage = this.messages.emailAlreadyInUse;
          break;
        default:
          this.toastMessage = this.messages.default;
      }
      this.setOpenToast(true);
    }
     this.authForm.reset();
  }

  async onResendVerificationEmail() {
    this.emailVerificationMessage = null;
    try{
      await this.authService.resendVerificationEmail();
      this.toastMessage = this.messages.emailVerification;
    } catch(error) {
      this.toastMessage = this.messages.default;
    }
    this.setOpenToast(true);
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

  setOpenToast(openStatus: boolean) {
    this.isToastOpen = openStatus;
  }

  private async handleLoginRedirect(user: User) {

    if(!user) {
      this.router.navigateByUrl('/auth');
      return;
    }

    if(!user.emailVerified) {
      this.emailVerificationMessage = this.messages.emailNotVerified;
      // await firstValueFrom(this.authService.logout());
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
          case 'tutor':
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
    const isTutorControl = this.authForm.get('isTutor');
    if(!this.isLoginMode) {
      if(!isTutorControl) {
        this.authForm.addControl('isTutor', this.formBuilder.control(false));
      }
    } else {
      this.authForm.removeControl('isTutor');
    }
  }
}
