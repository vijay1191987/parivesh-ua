import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpatialSearchComponent } from './spatial-search.component';

describe('SpatialSearchComponent', () => {
  let component: SpatialSearchComponent;
  let fixture: ComponentFixture<SpatialSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpatialSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpatialSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
