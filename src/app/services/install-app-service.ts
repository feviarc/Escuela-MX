import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class InstallAppService {

  private installPromptEvent: any;

  constructor() {
    this.installPromptEvent = null;
  }

  get eventStatus() {
    return this.installPromptEvent;
  }

  set eventStatus(event: any) {
    this.installPromptEvent = event;
  }

  showInstallAppBanner() {
    this.installPromptEvent.prompt();
    this.installPromptEvent.userChoice.then(
      (chosenButton: any) => {
        if (chosenButton.outcome === 'accepted') {
          this.installPromptEvent = null;
        }
      }
    );
  }
}
