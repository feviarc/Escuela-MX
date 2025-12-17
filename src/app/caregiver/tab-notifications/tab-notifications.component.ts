import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonProgressBar } from "@ionic/angular/standalone";

@Component({
  selector: 'app-tab-notifications',
  templateUrl: './tab-notifications.component.html',
  styleUrls: ['./tab-notifications.component.scss'],
  standalone: true,
  imports: [IonProgressBar, IonHeader, IonToolbar, IonTitle, IonContent

  ]
})
export class TabNotificationsComponent  implements OnInit {

  isLoading = true;

  constructor() { }

  ngOnInit() {}

}
