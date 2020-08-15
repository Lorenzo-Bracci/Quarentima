import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyListsMovieComponent } from './my-lists-movie.component';

describe('MyListsMovieComponent', () => {
  let component: MyListsMovieComponent;
  let fixture: ComponentFixture<MyListsMovieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyListsMovieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyListsMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
