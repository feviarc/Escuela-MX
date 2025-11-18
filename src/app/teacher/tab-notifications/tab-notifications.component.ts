import { Component, OnInit } from '@angular/core';

import {
  IonContent,
  IonHeader,
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
    IonContent,
    IonHeader,
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabNotificationsComponent  implements OnInit {

  isLoading = true;

  constructor() { }

  ngOnInit() {}

}
