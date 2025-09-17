import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaregiverPage } from './caregiver.page';

describe('CaregiverPage', () => {
  let component: CaregiverPage;
  let fixture: ComponentFixture<CaregiverPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CaregiverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
