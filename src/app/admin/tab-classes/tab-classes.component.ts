import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-tab-classes',
  templateUrl: './tab-classes.component.html',
  styleUrls: ['./tab-classes.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
  ]
})

export class TabClassesComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
