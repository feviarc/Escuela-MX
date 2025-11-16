import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router } from  '@angular/router';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonListHeader,
  IonNote,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { AuthService } from '../services/auth.service';
import { CctStorageService } from '../services/cct-storage.service';
import { School, SchoolCRUDService } from '../services/school-crud.service';



@Component({
  selector: 'app-maestro',
  templateUrl: './teacher.page.html',
  styleUrls: ['./teacher.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonListHeader,
    IonNote,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonText,
    IonTitle,
    IonToolbar,
    ReactiveFormsModule,
  ]
})

export class TeacherPage implements OnInit {

  cct = '';
  school?: School | null;
  isUserActive = false;

  form = this.formBuilder.group({
    celular: ['',[
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
    ]],
    nombre: ['',[
      Validators.required,
      Validators.pattern('^[A-Za-zÑñÁÉÍÓÚáéíóú ]+$')
    ]],
    escuela: [''],
    telefono: ['',[
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
    ]]
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cctStorageService: CctStorageService,
    private schoolCRUDService: SchoolCRUDService
  ) {}

  get telefono() {
    return this.form.get('telefono')!;
  }

  get nombre() {
    return this.form.get('nombre')!;
  }

  get celular() {
    return this.form.get('celular')!;
  }

  ngOnInit() {
    const cct = this.cctStorageService.getCCT();
    this.cct = (cct !== null ? cct : '');

    this.schoolCRUDService.getSchoolByCCT(this.cct).subscribe({
      next: school => {
        this.school = school;
        const escuela = this.school?.nombre;
        if(!escuela) {
          return;
        }
        this.form.get('escuela')?.setValue(escuela);
      }
    });
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

  onUpdateUserProfile() {
    console.log(this.form.value);
    this.isUserActive = true;
    this.form.reset();
  }
}
