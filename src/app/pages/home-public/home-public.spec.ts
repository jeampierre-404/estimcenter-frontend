import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePublicComponent } from './home-public';

describe('HomePublic', () => {
  let component: HomePublicComponent;
  let fixture: ComponentFixture<HomePublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePublicComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
