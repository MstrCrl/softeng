import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacultyPage } from './faculty.page';

describe('FacultyPage', () => {
  let component: FacultyPage;
  let fixture: ComponentFixture<FacultyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FacultyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
