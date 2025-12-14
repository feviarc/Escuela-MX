import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';

import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonNote,
  IonProgressBar,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from "@ionic/angular/standalone";

import { Subscription } from 'rxjs';
import { CaregiverNotificationsCRUDService, NotificationInput } from 'src/app/services/caregiver-notifications-crud.service';
import { CctStorageService } from 'src/app/services/cct-storage.service';
import { StudentCRUDService, Student } from 'src/app/services/student-crud.service';
import { StudentGroupCRUDService, StudentGroup } from 'src/app/services/student-group-crud.service';
import { SubjectCRUDService, Subject } from 'src/app/services/subject-crud.service';

@Component({
  selector: 'app-teacher-tab-notifications',
  templateUrl: './tab-notifications.component.html',
  styleUrls: ['./tab-notifications.component.scss'],
  standalone: true,
  imports: [
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonListHeader,
    IonModal,
    IonNote,
    IonProgressBar,
    IonTextarea,
    IonTitle,
    IonToast,
    IonToggle,
    IonToolbar,
  ]
})

export class TabNotificationsComponent  implements OnInit, OnDestroy {

  @ViewChildren(IonModal) modals!: QueryList<IonModal>;
  @ViewChildren(IonCheckbox) checkboxes!: QueryList<IonCheckbox>;

  breakpoints = [0, 1];
  cct!: string;
  initialBreakpoint = 1;
  isAbsenceButtonDisabled = false;
  isLoading = false;
  isToastOpen = false;
  selectedDate!: string | null;
  selectedSubjects: string[] = [];
  studentDidntShowUp = true;
  studentGroups: StudentGroup[] = [];
  studentsWithGroup: Student[] = [];
  subjects: Subject[] = [];
  teacherComments = '';
  toastMessage = '';
  private subscriptions: Subscription[] = [];

  dateFormatOptions = {
    date: {
      weekday: 'short',
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    }
  };

  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0 && utcDay !== 6;
  };

  constructor(
    private caregiverNotifCRUDService: CaregiverNotificationsCRUDService,
    private cctStorageService: CctStorageService,
    private studentCRUDService: StudentCRUDService,
    private studentGroupCRUDService: StudentGroupCRUDService,
    private subjectCRUDService: SubjectCRUDService,
  ) { }

  ngOnInit() {
    const cct = this.cctStorageService.getCCT();
    this.cct = (cct !== null ? cct : '');

    this.isLoading = true;

    this.resetDate();
    this.loadSchoolGroups();
    this.loadSubjects();
    this.loadStudents();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  closeModal(triggerId: string | undefined) {
    if(!triggerId) {
      return;
    }

    const modal = this.modals.find(m => m.trigger === triggerId);

    if(!modal) {
      return;
    }

    try {
      modal.dismiss();
    } catch(error) {
      console.log(error);
    }
  }

  formatTimestampToISO(timestamp: number) {
    const date = new Date(timestamp);

    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Belize'
    });

    let formattedDate = dateFormatter.format(date);
    formattedDate = formattedDate.replace(', ', 'T').replace(/ /g, '');

    return formattedDate;
  }

  loadSchoolGroups() {
    const sub = this.studentGroupCRUDService.getStudentGroupsByCCT(this.cct).subscribe({
      next: groups => {
        console.log('studentGroups:', groups);
        this.studentGroups = groups;
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  loadSubjects() {
    this.subjectCRUDService.getSubjectsSnapshot().subscribe({
      next: (subjects) => {
        this.subjects = subjects.map(
          (subject) => ({
            grado: subject.grado,
            id: subject.id,
            nombre: subject.nombre,
            selected: false
          })
        );
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });
  }

  loadStudents() {
    const sub = this.studentCRUDService.getStudentsWithGroupByCCT(this.cct).subscribe({
      next: (students) => {
        students.sort(
          (a, b) => {
            if(!a.gid || !b.gid) {
              return 0;
            }
            return a.gid.localeCompare(b.gid);
          }
        );

        this.studentsWithGroup = students;
        this.isLoading = false;

        console.log('this.studentsWithGroup:', students);
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  async onAddAbsence(student: Student) {
    this.closeModal('absence-' + student.id);

    if(!student.id || !student.tid) {
      return;
    }

    const notification: NotificationInput = {
      sid: student.id,
      nombreCompleto: student.nombreCompleto,
      tipo: 'Inasistencia',
      fecha: this.selectedDate || undefined,
      observaciones: this.teacherComments,
      materias: this.selectedSubjects,
    };

    await this.caregiverNotifCRUDService.addNotification(student.tid, notification);
    this.showToast('📤 Se ha enviado la notificación de inasistencia.');
  }

  async onAddNoncompliance(student: Student) {
    this.closeModal('noncompliance-' + student.id);

    if(!student.id || !student.tid) {
      return;
    }

    const notification: NotificationInput = {
      sid: student.id,
      tipo: 'Incumplimiento',
      nombreCompleto: student.nombreCompleto,
      observaciones: this.teacherComments,
      materias: this.selectedSubjects,
    };
    await this.caregiverNotifCRUDService.addNotification(student.tid, notification);
    this.showToast('📤 Se ha enviado la notificación de incumplimiento.');
  }

  async onAddMisconduct(student: Student) {
    this.closeModal('misconduct-' + student.id);

    if(!student.id || !student.tid) {
      return;
    }

    const notification: NotificationInput = {
      sid: student.id,
      tipo: 'Indisciplina',
      nombreCompleto: student.nombreCompleto,
      observaciones: this.teacherComments,
      materias: this.selectedSubjects,
    };

    await this.caregiverNotifCRUDService.addNotification(student.tid, notification);
    this.showToast('📤 Se ha enviado la notificación de indisciplina.');
  }

  onCommentsChange(event: CustomEvent) {
    this.teacherComments = event.detail.value;
  }

  async onModalDismiss(slidingItem: IonItemSliding) {
    await slidingItem.close();

    this.resetDate();
    this.isAbsenceButtonDisabled = false;
    this.studentDidntShowUp = true;

    this.teacherComments = '';
    this.selectedSubjects = [];
    // Modificar
    this.subjects.forEach(s => s.selected = false);
  }

  onDatetimePickerChange(event: CustomEvent) {
    this.selectedDate = event.detail.value;
  }

  onSubjectChange(subject: any) {
    subject.selected = !subject.selected;

    // Modificar
    this.selectedSubjects = this.subjects
    .filter(m => m.selected)
    .map(m => m.nombre);

    console.log('selectedSubjects.length', this.selectedSubjects.length);
    console.log('selectedSubjects', this.selectedSubjects);
    console.log('subjects', this.subjects);


    // Validar la ausencia a la escuela
    if(!this.studentDidntShowUp) {
      if(this.selectedSubjects.length > 0) {
        this.isAbsenceButtonDisabled = false;
      } else {
        this.isAbsenceButtonDisabled = true;
      }
    }
  }

  onStudentDidntShowUpChange() {
    this.studentDidntShowUp = !this.studentDidntShowUp;

    if(!this.studentDidntShowUp && this.selectedSubjects.length === 0) {
      this.isAbsenceButtonDisabled = true;
    }

    if(this.studentDidntShowUp) {
      this.isAbsenceButtonDisabled = false;
      this.selectedSubjects = [];
      // Modificar
      this.subjects.forEach(s => s.selected = false);
      this.checkboxes.forEach(c => c.checked = false);
    }
  }

  resetDate() {
    this.selectedDate = this.formatTimestampToISO(Date.now());
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  studentsListByGroup(groupGid: string) {
    const students = this.studentsWithGroup.filter(
      (student) => student.gid === groupGid
    );

    students.sort(
      (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)
    );

    return students;
  }

  subjectsByGrade(grade: string) {
    return this.subjects.filter(
      (subject) => subject.grado === grade
    );
  }
}
