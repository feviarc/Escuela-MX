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
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";

import { Subscription } from 'rxjs';
import { CctStorageService } from 'src/app/services/cct-storage.service';
import { StudentCRUDService, Student } from 'src/app/services/student-crud.service';
import { StudentGroupCRUDService, StudentGroup } from 'src/app/services/student-group-crud.service';

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
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabNotificationsComponent  implements OnInit, OnDestroy {

  @ViewChildren(IonModal) modals!: QueryList<IonModal>;

  breakpoints = [0, 1];
  cct!: string;
  initialBreakpoint = 1;
  isLoading = false;
  selectedDate!: string | null;
  studentGroups: StudentGroup[] = [];
  studentsWithGroup: Student[] = [];
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
    private cctStorageService: CctStorageService,
    private studentCRUDService: StudentCRUDService,
    private studentGroupCRUDService: StudentGroupCRUDService,
  ) { }

  ngOnInit() {
    const cct = this.cctStorageService.getCCT();
    this.cct = (cct !== null ? cct : '');

    this.isLoading = true;

    this.resetDate();
    this.loadSchoolGroups();
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

  onAddAbsence(student: Student) {


    this.closeModal('absence-' + student.id);
    console.log('selectedDate', this.selectedDate)
    this.resetDate();
  }

  onAddNoncompliance(student: Student) {
    console.log('onAddNoncompliance', student);
    this.closeModal('noncompliance-' + student.id);
  }

  onAddMisconduct(student: Student) {
    console.log('onAddMisconduct', student);
    this.closeModal('misconduct-' + student.id);
  }

  async onModalDismiss(slidingItem: IonItemSliding) {
    await slidingItem.close();
  }

  onSelectedDate(event: CustomEvent) {
    this.selectedDate = event.detail.value;
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

  resetDate() {
    this.selectedDate = this.formatTimestampToISO(Date.now());
  }
}
