import { Component, OnInit } from '@angular/core';

import {
  IonContent,
  IonHeader,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";


@Component({
  selector: 'app-teacher-tab-students',
  templateUrl: './tab-students.component.html',
  styleUrls: ['./tab-students.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabStudentsComponent  implements OnInit {

  isLoading = true;

  constructor() { }

  ngOnInit() {}

}
