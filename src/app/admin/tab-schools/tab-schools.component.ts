import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/angular/standalone";


@Component({
  selector: 'app-tab-schools',
  templateUrl: './tab-schools.component.html',
  styleUrls: ['./tab-schools.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
  ]
})

export class TabSchoolsComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
