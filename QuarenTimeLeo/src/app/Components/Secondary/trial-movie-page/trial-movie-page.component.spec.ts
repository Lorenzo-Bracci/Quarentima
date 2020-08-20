import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialMoviePageComponent } from './trial-movie-page.component';

describe('TrialMoviePageComponent', () => {
  let component: TrialMoviePageComponent;
  let fixture: ComponentFixture<TrialMoviePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrialMoviePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialMoviePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
