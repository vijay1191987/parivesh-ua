import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DssToolsComponent } from './dss-tools.component';

describe('DssToolsComponent', () => {
  let component: DssToolsComponent;
  let fixture: ComponentFixture<DssToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DssToolsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DssToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
