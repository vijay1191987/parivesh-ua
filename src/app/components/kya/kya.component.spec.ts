import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KyaComponent } from './kya.component';

describe('KyaComponent', () => {
  let component: KyaComponent;
  let fixture: ComponentFixture<KyaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KyaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KyaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
