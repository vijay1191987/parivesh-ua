import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GisComponentComponent } from './parivesh-map.component';

describe('GisComponentComponent', () => {
  let component: GisComponentComponent;
  let fixture: ComponentFixture<GisComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GisComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GisComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
