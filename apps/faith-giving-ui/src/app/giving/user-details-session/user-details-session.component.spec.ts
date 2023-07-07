import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsSessionComponent } from './user-details-session.component';

describe('UserDetailsSessionComponent', () => {
  let component: UserDetailsSessionComponent;
  let fixture: ComponentFixture<UserDetailsSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDetailsSessionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
