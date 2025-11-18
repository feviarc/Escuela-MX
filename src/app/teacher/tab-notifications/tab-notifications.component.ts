import { Component, OnInit } from '@angular/core';

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

export class TabNotificationsComponent  implements OnInit {

  isLoading = false;

  constructor() { }

  ngOnInit() {}

  // onAddStudent(event: MouseEvent) {
  //   event.stopPropagation();
  // }
}
