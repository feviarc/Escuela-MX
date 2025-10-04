import { TestBed } from '@angular/core/testing';

import { InstallAppService } from './install-app-service';

describe('InstallAppService', () => {
  let service: InstallAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstallAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
