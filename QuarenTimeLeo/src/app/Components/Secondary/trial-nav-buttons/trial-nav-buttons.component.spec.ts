import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialNavButtonsComponent } from './trial-nav-buttons.component';

describe('TrialNavButtonsComponent', () => {
  let component: TrialNavButtonsComponent;
  let fixture: ComponentFixture<TrialNavButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrialNavButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialNavButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
