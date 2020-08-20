import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialPictureCardComponent } from './trial-picture-card.component';

describe('TrialPictureCardComponent', () => {
  let component: TrialPictureCardComponent;
  let fixture: ComponentFixture<TrialPictureCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrialPictureCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialPictureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
