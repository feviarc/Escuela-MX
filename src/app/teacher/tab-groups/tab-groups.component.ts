import { Component, OnInit } from '@angular/core';

import {
  IonContent,
  IonHeader,
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
    IonContent,
    IonHeader,
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabGroupsComponent  implements OnInit {

  isLoading = true;

  constructor() { }

  ngOnInit() {}

}
