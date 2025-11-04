import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/angular/standalone";


@Component({
  selector: 'app-tab-courses',
  templateUrl: './tab-courses.component.html',
  styleUrls: ['./tab-courses.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
  ]
})

export class TabCoursesComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
