import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';

import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
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
  IonTitle,
  IonToolbar, IonToast } from "@ionic/angular/standalone";

import { Subscription } from 'rxjs';
import { School } from '../../services/school-crud.service';
import { GroupCRUDService, Group } from 'src/app/services/group-crud.service';
import { SchoolStateService } from 'src/app/services/school-state-service';
import { StudentGroupCRUDService, StudentGroup } from 'src/app/services/student-group-crud.service';


@Component({
  selector: 'app-teacher-tab-groups',
  templateUrl: './tab-groups.component.html',
  styleUrls: ['./tab-groups.component.scss'],
  standalone: true,
  imports: [IonToast,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
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
    IonTitle,
    IonToolbar,
  ]
})

export class TabGroupsComponent  implements OnInit, OnDestroy {

  @ViewChildren(IonModal) modals!: QueryList<IonModal>;

  breakpoints = [0, 0.40];
  groups: Group[] = [];
  groupsSubscription!: Subscription;
  studentGroupsSubscription!: Subscription;
  initialBreakpoint = 0.40;
  isLoading = false;
  isToastOpen = false;
  pickerValue!: string;
  school: School | null = null;
  toastMessage = '🛑';
  studentGroups: StudentGroup[] = [];

  constructor(
    private groupCRUDService: GroupCRUDService,
    private schoolStateService: SchoolStateService,
    private studentGroupCRUDService: StudentGroupCRUDService,
  ) { }

  ngOnInit() {
    this.loadSchoolInfo();
    this.loadGroupsInfo();
    this.loadSchoolGroups();
  }

  ngOnDestroy() {
    if(this.groupsSubscription) {
      this.groupsSubscription.unsubscribe();
    }
    if(this.studentGroupsSubscription) {
      this.studentGroupsSubscription.unsubscribe();
    }
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
    return `${this.school?.cct}-${group?.grado}${group?.letra}`;
  }

  loadGroupsInfo() {
    this.groupsSubscription = this.groupCRUDService.getGroups().subscribe({
      next: groups => {
        this.groups = groups;
        console.log(groups);
      },
      error: (e) => {
        console.log('Error:', e)
      }
    });
  }

  loadSchoolGroups() {
    this.studentGroupsSubscription = this.studentGroupCRUDService.studentGroups$.subscribe({
      next: groups => {
        console.log('studentGroups:', groups);
        this.studentGroups = groups;
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });
  }

  loadSchoolInfo() {
    this.schoolStateService.school$.subscribe(
      school => {
        this.school = school;
        console.log('tab-groups.component.ts', 'school', this.school);
      }
    );
  }

  onDidDismiss(event: CustomEvent) {
    if(!event.detail.data) {
      return;
    }

    const selectedGroup = this.groups.find(g => g.id === this.pickerValue);

    const newGroup: StudentGroup = {
      gid: this.generateGroupId(selectedGroup) ?? '',
      cct: this.school?.cct ?? '',
      grado: selectedGroup?.grado ?? '',
      letra: selectedGroup?.letra ?? '',
      alumnos: []
    };

    this.studentGroupCRUDService.addStudentGroup(newGroup).subscribe({
      error: (error) => {
        this.showToast(`🛑 El ${selectedGroup?.nombre} ya existe.` );
      }
    });
  }

  onIonChange(event: CustomEvent) {
    this.pickerValue = event.detail.value;
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }
}
