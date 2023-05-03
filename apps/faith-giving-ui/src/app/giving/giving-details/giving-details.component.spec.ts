import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GivingDetailsComponent } from './giving-details.component';

describe('GivingDetailsComponent', () => {
  let component: GivingDetailsComponent;
  let fixture: ComponentFixture<GivingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GivingDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GivingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
