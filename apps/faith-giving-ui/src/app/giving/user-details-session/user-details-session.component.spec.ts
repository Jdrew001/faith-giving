import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { UserDetailsSessionComponent } from './user-details-session.component';

describe('UserDetailsSessionComponent', () => {
  let component: UserDetailsSessionComponent;
  let fixture: ComponentFixture<UserDetailsSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDetailsSessionComponent],
      imports: [ButtonModule, AvatarModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
