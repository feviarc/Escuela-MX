import { Component, OnInit, OnDestroy } from '@angular/core';

import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";

import { Subscription } from 'rxjs';
import { StudentGroupCRUDService, StudentGroup } from 'src/app/services/student-group-crud.service';


@Component({
  selector: 'app-teacher-tab-notifications',
  templateUrl: './tab-notifications.component.html',
  styleUrls: ['./tab-notifications.component.scss'],
  standalone: true,
  imports: [
    IonAccordion,
    IonAccordionGroup,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabNotificationsComponent  implements OnInit, OnDestroy {

  isLoading = false;
  studentGroupsSubscription!: Subscription;
  studentGroups: StudentGroup[] = [];

  constructor(
    private studentGroupCRUDService: StudentGroupCRUDService,
  ) { }

  ngOnInit() {
    this.loadSchoolGroups();
  }

  ngOnDestroy() {
    if(this.studentGroupsSubscription) {
      this.studentGroupsSubscription.unsubscribe();
    }
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

  // onAddStudent(event: MouseEvent) {
  //   event.stopPropagation();
  // }
}
