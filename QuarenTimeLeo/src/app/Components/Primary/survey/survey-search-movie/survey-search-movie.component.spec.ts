import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveySearchMovieComponent } from './survey-search-movie.component';

describe('SurveySearchMovieComponent', () => {
  let component: SurveySearchMovieComponent;
  let fixture: ComponentFixture<SurveySearchMovieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveySearchMovieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySearchMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
