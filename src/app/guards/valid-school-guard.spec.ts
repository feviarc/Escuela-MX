import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { validSchoolGuard } from './valid-school-guard';

describe('validSchoolGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validSchoolGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
