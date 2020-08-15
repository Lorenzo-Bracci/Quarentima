import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestorepasswordComponent } from './restorepassword.component';

describe('RestorepasswordComponent', () => {
  let component: RestorepasswordComponent;
  let fixture: ComponentFixture<RestorepasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestorepasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestorepasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
