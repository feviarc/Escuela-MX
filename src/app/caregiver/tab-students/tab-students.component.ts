import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonProgressBar, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-tab-students',
  templateUrl: './tab-students.component.html',
  styleUrls: ['./tab-students.component.scss'],
  standalone: true,
  imports: [IonContent, IonProgressBar, IonTitle, IonToolbar, IonHeader,

  ]
})
export class TabStudentsComponent  implements OnInit {

  isLoading = true;

  constructor() { }

  ngOnInit() {}

}
