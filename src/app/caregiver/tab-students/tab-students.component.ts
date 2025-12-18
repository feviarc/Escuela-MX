import { Auth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonProgressBar,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonTitle,
  IonToolbar, IonItemSliding, IonLabel, IonNote } from "@ionic/angular/standalone";

import { User } from 'firebase/auth'
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CctStorageService } from 'src/app/services/cct-storage.service';
import { StudentCRUDService, Student } from 'src/app/services/student-crud.service';


@Component({
  selector: 'app-tab-students',
  templateUrl: './tab-students.component.html',
  styleUrls: ['./tab-students.component.scss'],
  standalone: true,
  imports: [IonNote, IonLabel, IonItemSliding,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonModal,
    IonProgressBar,
    IonRadio,
    IonRadioGroup,
    IonSearchbar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabStudentsComponent  implements OnInit {

  cct!: string;
  filteredStudentsWithoutTutor: Student[] = [];
  isLoading = true;
  selectedStudent: any;
  studentsWithoutTutor: Student[] = [];
  studentsByTutor: Student[] = [];
  subscriptions: Subscription[] = [];
  tabMessage = '';
  tid?: string;
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private cctStorageService: CctStorageService,
    private studentCRUDService: StudentCRUDService,
  ) { }

  ngOnInit() {
    const cct = this.cctStorageService.getCCT();
    this.cct = (cct !== null ? cct : '');

    this.getCurrentUser();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async getCurrentUser() {
    try {
      this.user = await firstValueFrom(this.authService.getCurrentUser());
      this.tid = this.user?.uid;

      if (this.tid) {
        this.loadStudentsByTutor(this.tid);
      }
    } catch(error) {
      console.log('Error:', error);
    }
  }

  handleInputSearchbar(event: CustomEvent) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toUpperCase() || '';
    console.log('event', event);

    this.filteredStudentsWithoutTutor = this.studentsWithoutTutor.filter(
      (student) => student.nombreCompleto.includes(query)
    );

    if(this.filteredStudentsWithoutTutor.length === 0) {
      this.tabMessage = `No se encontraron alumnos con la frase "${query}". Puedes intentar buscar colocando o quitando acentos en tu búsqueda.`;
    }
  }

  loadStudentsByTutor(id: string) {
    const sub = this.studentCRUDService.getStudentsByTutor(id).subscribe({
      next: (students) => {
        students.sort(
            (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)
        );
        this.studentsByTutor = students;
        console.log('StudentsByTutor:', this.studentsByTutor);
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  loadStudentsWithoutTutor(cct: string) {
    if(!cct) {
      return;
    }

    console.log('tid:', this.tid);

    const sub = this.studentCRUDService.getStudentsWithoutTutorByCCT(cct).subscribe({
      next: (students) => {
        students.sort(
            (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)
        );
        this.studentsWithoutTutor = students;
        this.filteredStudentsWithoutTutor = [...students];
        console.log('StudentsWithoutTutor', this.filteredStudentsWithoutTutor)
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  selectStudentCompareWith(s1: Student, s2: Student): boolean {
    return s1.id === s2.id;
  }

  selectStudentHandleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedStudent = target.value;
  }
}
