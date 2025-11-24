import { Component, OnInit } from '@angular/core';

import {
  IonContent,
  IonHeader,
  IonProgressBar,
  IonTitle,
  IonToolbar, IonFab, IonFabButton, IonIcon, IonModal } from "@ionic/angular/standalone";


@Component({
  selector: 'app-teacher-tab-students',
  templateUrl: './tab-students.component.html',
  styleUrls: ['./tab-students.component.scss'],
  standalone: true,
  imports: [IonModal, IonIcon, IonFabButton, IonFab,
    IonContent,
    IonHeader,
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabStudentsComponent  implements OnInit {

  isLoading = false;
  breakpoints = [0, 0.20, 0.40, 0.60, 0.80, 1];
  initialBreakpoint = 0.80;

  constructor() { }

  ngOnInit() {}

}
