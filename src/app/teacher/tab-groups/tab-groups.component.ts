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
  IonToolbar,
} from "@ionic/angular/standalone";

import { School } from '../../services/school-crud.service';
import { GroupCRUDService, Group } from 'src/app/services/group-crud.service';
import { SchoolStateService } from 'src/app/services/school-state-service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-teacher-tab-groups',
  templateUrl: './tab-groups.component.html',
  styleUrls: ['./tab-groups.component.scss'],
  standalone: true,
  imports: [
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
  pickerValue!: string;
  groups: Group[] = [];
  initialBreakpoint = 0.40;
  isLoading = false;
  school: School | null = null;
  groupSubscription!: Subscription;

  constructor(
    private groupCRUDService: GroupCRUDService,
    private schoolStateService: SchoolStateService,
  ) { }

  ngOnInit() {
    this.schoolStateService.school$.subscribe(
      school => {
        this.school = school;
        console.log('tab-groups.component.ts', this.school);
      }
    );

    this.groupSubscription = this.groupCRUDService.getGroups().subscribe({
      next: groups => {
        this.groups = groups;
        console.log(groups);
      },
      error: (e) => {
        console.log('Error:', e)
      }
    });
  }

  ngOnDestroy(): void {
    if(this.groupSubscription) {
      this.groupSubscription.unsubscribe();
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

  onDidDismiss(event: CustomEvent) {
    if(!event.detail.data) {
      return;
    }

    const selectedGroup = this.groups.find(g => g.id === this.pickerValue);
    const group = {
      grado: selectedGroup?.grado,
      letra: selectedGroup?.letra,
      nombre: selectedGroup?.nombre,
    };
    console.log(group);
  }

  onIonChange(event: CustomEvent) {
    this.pickerValue = event.detail.value;
  }
}
