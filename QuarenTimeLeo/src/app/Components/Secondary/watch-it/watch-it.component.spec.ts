import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchItComponent } from './watch-it.component';

describe('WatchItComponent', () => {
  let component: WatchItComponent;
  let fixture: ComponentFixture<WatchItComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchItComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchItComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
