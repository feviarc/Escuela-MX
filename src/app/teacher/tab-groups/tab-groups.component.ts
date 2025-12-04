import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';

import { Router } from '@angular/router';

import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonPicker,
  IonPickerColumn,
  IonPickerColumnOption,
  IonProgressBar,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/angular/standalone";

  import { OverlayEventDetail } from '@ionic/core/components';
  import { Subscription } from 'rxjs';
  import { School } from 'src/app/services/school-crud.service';
  import { AuthService } from 'src/app/services/auth.service';
  import { CctStorageService } from 'src/app/services/cct-storage.service';
  import { GroupCRUDService, Group } from 'src/app/services/group-crud.service';
  import { SchoolStateService } from 'src/app/services/school-state-service';
  import { StudentCRUDService, Student } from 'src/app/services/student-crud.service';
  import { StudentGroupCRUDService, StudentGroup } from 'src/app/services/student-group-crud.service';


@Component({
  selector: 'app-teacher-tab-groups',
  templateUrl: './tab-groups.component.html',
  styleUrls: ['./tab-groups.component.scss'],
  standalone: true,
  imports: [
    IonActionSheet,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonModal,
    IonPicker,
    IonPickerColumn,
    IonPickerColumnOption,
    IonProgressBar,
    IonRadio,
    IonRadioGroup,
    IonSearchbar,
    IonSpinner,
    IonTitle,
    IonToast,
    IonToolbar,
  ]
})

export class TabGroupsComponent  implements OnInit, OnDestroy {

  @ViewChildren(IonModal) modals!: QueryList<IonModal>;

  breakpoints = [0, 0.40];
  cct!: string;
  filteredStudentsWithGroup: Student[] = [];
  filteredStudentsWithoutGroup: Student[] = [];
  groupsInfo: Group[] = [];
  initialBreakpoint = 0.40;
  isFirstEmission = true;
  isLoading = true;
  isSpinnerActive = false;
  isToastOpen = false;
  pickerValue!: string;
  schoolInfo: School | null = null;
  selectedStudent!: any;
  spinnerText = '';
  studentGroups: StudentGroup[] = [];
  studentsListByGroup: Student[] = [];
  studentsWithGroup: Student[] = [];
  studentsWithoutGroup: Student[] = [];
  tabMessage = 'No hay alumnos disponibles para asignarlos al grupo.';
  toastMessage = '🛑';
  private subscriptions: Subscription[] = [];

  public actionSheetButtons = [
    {
      text: 'Eliminar',
      role: 'destructive',
      data: {
        action: 'delete',
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
    private cctStorageService: CctStorageService,
    private groupCRUDService: GroupCRUDService,
    private schoolStateService: SchoolStateService,
    private studentCRUDService: StudentCRUDService,
    private studentGroupCRUDService: StudentGroupCRUDService,
  ) { }

  ngOnInit() {
    const cct = this.cctStorageService.getCCT();
    this.cct = (cct !== null ? cct : '');

    this.loadSchoolInfo();
    this.loadGroupsInfo();
    this.loadStudentsGroups(this.cct);
    this.loadStudents(this.cct);
  }

  ngOnDestroy() {
     this.subscriptions.forEach(sub => sub.unsubscribe());
  }



  closeModal(triggerId: string) {
    if(!triggerId) {
      return;
    }

    const modal = this.modals.find(m => m.trigger === triggerId);

    if(!modal) {
      return;
    }

    modal.dismiss();
  }

  generateGroupId(group: Group | undefined) {
    return `${this.schoolInfo?.cct}-${group?.grado}${group?.letra}`;
  }

  handleInputAddStudent(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toUpperCase() || '';
    console.log('event', event);

    this.filteredStudentsWithoutGroup = this.studentsWithoutGroup.filter(
      (student) => student.nombreCompleto.includes(query)
    );

    if(this.filteredStudentsWithoutGroup.length === 0) {
      this.tabMessage = `No se encontraron alumnos con la frase "${query}". Puedes intentar buscar colocando o quitando acentos en tu búsqueda.`;
    }
  }

  handleInputDeleteStudent(event: CustomEvent, group: StudentGroup) {
    if(!event.detail.event || !event.detail.value) {
      this.studentsListByGroup = this.studentsWithGroup.filter(
      (student) => student.gid === group.gid
    );
      return;
    }

    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toUpperCase() || '';
    console.log('event', event);

    this.studentsListByGroup = this.studentsWithGroup.filter(
      (student) => student.nombreCompleto.includes(query)
    );

    if(this.studentsListByGroup.length === 0) {
      this.tabMessage = `No se encontraron alumnos con la frase "${query}". Puedes intentar buscar colocando o quitando acentos en tu búsqueda.`;
    }
  }

  loadGroupsInfo() {
    const sub = this.groupCRUDService.getGroups().subscribe({
      next: groups => {
        this.groupsInfo = groups;
        console.log(groups);
      },
      error: (e) => {
        console.log('Error:', e)
      }
    });

    this.subscriptions.push(sub);
  }

  loadStudents(cct: string) {
    if(!cct) {
      console.log('No se encontró la CCT');
      return;
    }

    const sub1 = this.studentCRUDService.getStudentsWithoutGroupByCCT(cct).subscribe({
      next: (students) => {
          students.sort(
            (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)
          );
          this.studentsWithoutGroup = students;
          this.filteredStudentsWithoutGroup = [...students];
          console.log('filteredStudentsWithoutGroup',this.filteredStudentsWithoutGroup);
      },
      error: (error) => {
        console.log('Error', error);
      }
    });

    const sub2 = this.studentCRUDService.getStudentsWithGroupByCCT(cct).subscribe({
      next: (students) => {
        students.sort(
          (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)
        );
        this.studentsWithGroup = students;
        this.filteredStudentsWithGroup = [...students];
        console.log('filteredStudentsWithGroup', this.filteredStudentsWithGroup);
      },
      error: (error) => {
        console.log('Error', error);
      }
    });

    this.subscriptions.push(sub1);
    this.subscriptions.push(sub2);
  }

  loadStudentsGroups(cct: string) {
    if(!cct) {
      console.log('No se encontró la CCT');
      return;
    }

    const sub = this.studentGroupCRUDService.getStudentGroupsByCCT(cct).subscribe({
      next: groups => {
        console.log('studentGroups:', groups);
        this.studentGroups = groups;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  loadStudentsListByGroup(group: StudentGroup) {
    console.log('(willPresent) mapStudentGroup:', group);
    console.log('studentsWithGroup', this.studentsWithGroup);

    this.studentsListByGroup = this.studentsWithGroup.filter(
      (student) => student.gid === group.gid
    );

    console.log('studentsListByGroup', this.studentsListByGroup);

  }

  loadSchoolInfo() {
    const sub = this.schoolStateService.school$.subscribe(
      school => {
        this.schoolInfo = school;
        console.log('tab-groups.component.ts', 'school', this.schoolInfo);
      }
    );

    this.subscriptions.push(sub);
  }

  onAddStudent(group: StudentGroup) {
    console.log('student:', this.selectedStudent);
    console.log('gid:', group.gid);

    // update here the student and group info in Firestore

    this.selectedStudent = null;
  }

  onDeleteStudent(group: StudentGroup) {
    console.log('student:', this.selectedStudent);
    console.log('gid:', group.gid);

    // update here the student and group info in Firestore

    this.selectedStudent = null;
  }

  onDeleteGroup(
   event: CustomEvent<OverlayEventDetail>,
   slidingItem: IonItemSliding,
   group: StudentGroup
  ) {
    slidingItem.close();

    if(!event.detail.data) {
      return;
    }

    const action = event.detail.data.action;

    if(action === 'cancel') {
      return;
    }

    this.spinnerText = 'Eliminando...';
    this.isSpinnerActive = true;

    const sub = this.studentGroupCRUDService.deleteStudentGroup(group.gid).subscribe({
      next: () => {
        this.showToast(`🗑️ Se eliminó Grupo ${group.grado}° "${group.letra}"`);
        this.isSpinnerActive = false;
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  onDidDismiss(event: CustomEvent) {
    if(!event.detail.data) {
      return;
    }

    const selectedGroup = this.groupsInfo.find(g => g.id === this.pickerValue);
    const gid = this.generateGroupId(selectedGroup) ?? '';
    const groupExists = this.studentGroups.some(g => g.gid === gid);

    if(groupExists) {
      this.showToast(`🛑 El ${selectedGroup?.nombre} ya existe.` );
      return;
    }

    const newGroup: StudentGroup = {
      gid,
      cct: this.schoolInfo?.cct ?? '',
      grado: selectedGroup?.grado ?? '',
      letra: selectedGroup?.letra ?? '',
      alumnos: []
    };

    const sub = this.studentGroupCRUDService.addStudentGroup(newGroup).subscribe();
    this.subscriptions.push(sub);
  }

  onDidDismissAddStudentModal() {
    this.selectedStudent='';
    this.filteredStudentsWithoutGroup = [...this.studentsWithoutGroup];
  }

  onIonChange(event: CustomEvent) {
    this.pickerValue = event.detail.value;
  }

  onLogout(event: CustomEvent<OverlayEventDetail>) {
    const eventButton = event.detail.data;

    if(!eventButton || eventButton.action === 'cancel') {
      return;
    }

    const sub = this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/auth');
      },
      error: error => {
        console.log('Error al cerrar sesión: ',  error);
      }
    });

    this.subscriptions.push(sub);
  }

  selectStudentCompareWith(s1: Student, s2: Student): boolean {
    return s1.id === s2.id;
  }

  selectStudentHandleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    // console.log('Current value:', JSON.stringify(target.value));
    this.selectedStudent = target.value;
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }
}
