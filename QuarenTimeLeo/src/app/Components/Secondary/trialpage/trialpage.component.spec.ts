import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialpageComponent } from './trialpage.component';

describe('TrialpageComponent', () => {
  let component: TrialpageComponent;
  let fixture: ComponentFixture<TrialpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrialpageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
