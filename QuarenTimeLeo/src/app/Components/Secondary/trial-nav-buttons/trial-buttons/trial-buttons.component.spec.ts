import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialButtonsComponent } from './trial-buttons.component';

describe('TrialButtonsComponent', () => {
  let component: TrialButtonsComponent;
  let fixture: ComponentFixture<TrialButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrialButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
