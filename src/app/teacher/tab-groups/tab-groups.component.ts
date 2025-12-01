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
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/angular/standalone";

  import { OverlayEventDetail } from '@ionic/core/components';
  import { Subscription } from 'rxjs';
  import { AuthService } from 'src/app/services/auth.service';
  import { School } from 'src/app/services/school-crud.service';
  import { GroupCRUDService, Group } from 'src/app/services/group-crud.service';
  import { SchoolStateService } from 'src/app/services/school-state-service';
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
    IonSpinner,
    IonTitle,
    IonToast,
    IonToolbar,
  ]
})

export class TabGroupsComponent  implements OnInit, OnDestroy {

  @ViewChildren(IonModal) modals!: QueryList<IonModal>;

  breakpoints = [0, 0.40];
  groups: Group[] = [];
  groupsSubscription!: Subscription;
  initialBreakpoint = 0.40;
  isFirstEmission = true;
  isLoading = true;
  isSpinnerActive = false;
  isToastOpen = false;
  pickerValue!: string;
  school: School | null = null;
  spinnerText = '';
  studentGroups: StudentGroup[] = [];
  studentGroupsSubscription!: Subscription;
  toastMessage = '🛑';

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
    private groupCRUDService: GroupCRUDService,
    private schoolStateService: SchoolStateService,
    private studentGroupCRUDService: StudentGroupCRUDService,
  ) { }

  ngOnInit() {
    this.loadSchoolInfo();
    this.loadGroupsInfo();
    this.loadStudentGroups();
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

  loadStudentGroups() {
    this.studentGroupsSubscription = this.studentGroupCRUDService.studentGroups$.subscribe({
      next: groups => {
        console.log('studentGroups:', groups);
        this.studentGroups = groups;

        if(this.isFirstEmission) {
          this.isFirstEmission = false;
          this.isLoading = false;
        }

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

  onAddStudent(slidingItem: IonItemSliding) {
    slidingItem.close();
  }

  onDeleteStudent(slidingItem: IonItemSliding) {
    slidingItem.close();
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

    this.studentGroupCRUDService.deleteStudentGroup(group.gid).subscribe({
      next: () => {
        this.showToast(`🗑️ Se eliminó Grupo ${group.grado}° "${group.letra}"`);
        this.isSpinnerActive = false;
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });
  }

  onDidDismiss(event: CustomEvent) {
    if(!event.detail.data) {
      return;
    }

    const selectedGroup = this.groups.find(g => g.id === this.pickerValue);
    const gid = this.generateGroupId(selectedGroup) ?? '';
    const groupExists = this.studentGroups.some(g => g.gid === gid);

    if(groupExists) {
      this.showToast(`🛑 El ${selectedGroup?.nombre} ya existe.` );
      return;
    }

    const newGroup: StudentGroup = {
      gid,
      cct: this.school?.cct ?? '',
      grado: selectedGroup?.grado ?? '',
      letra: selectedGroup?.letra ?? '',
      alumnos: []
    };

    this.studentGroupCRUDService.addStudentGroup(newGroup).subscribe();
  }

  onIonChange(event: CustomEvent) {
    this.pickerValue = event.detail.value;
  }

  onLogout(event: CustomEvent<OverlayEventDetail>) {
    const eventButton = event.detail.data;

    if(!eventButton || eventButton.action === 'cancel') {
      return;
    }

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/auth');
      },
      error: error => {
        console.log('Error al cerrar sesión: ',  error);
      }
    });
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }
}
