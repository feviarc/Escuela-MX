import { Component, OnInit } from '@angular/core';

import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-teacher-tab-groups',
  templateUrl: './tab-groups.component.html',
  styleUrls: ['./tab-groups.component.scss'],
  standalone: true,
  imports: [
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabGroupsComponent  implements OnInit {

  isLoading = false;

  constructor() { }

  ngOnInit() {}

  onAddStudent(event: MouseEvent) {
    event.stopPropagation();

  }
}
