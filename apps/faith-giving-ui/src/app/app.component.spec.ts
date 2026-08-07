import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { AppComponent } from "./app.component";
import { AppVersionService } from "./core/services/app-version.service";

describe("AppComponent", () => {
  const appVersionService = {
    initialize: jest.fn(),
  };

  beforeEach(async () => {
    appVersionService.initialize.mockClear();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: AppVersionService,
          useValue: appVersionService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
    expect(app.title).toEqual("faith-giving-ui");
  });

  it("should initialize version checks on startup", () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(appVersionService.initialize).toHaveBeenCalledTimes(1);
  });
});
