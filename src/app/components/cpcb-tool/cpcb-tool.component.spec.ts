import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpcbToolComponent } from './cpcb-tool.component';

describe('CpcbToolComponent', () => {
  let component: CpcbToolComponent;
  let fixture: ComponentFixture<CpcbToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpcbToolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpcbToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
