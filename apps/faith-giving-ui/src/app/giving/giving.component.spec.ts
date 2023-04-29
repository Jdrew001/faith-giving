import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GivingComponent } from './giving.component';

describe('GivingComponent', () => {
  let component: GivingComponent;
  let fixture: ComponentFixture<GivingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GivingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
