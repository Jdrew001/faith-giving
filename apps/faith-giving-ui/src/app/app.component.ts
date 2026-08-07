import { Component, OnInit } from "@angular/core";

import { AppVersionService } from "./core/services/app-version.service";

@Component({
  selector: "faith-giving-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "faith-giving-ui";

  constructor(private appVersionService: AppVersionService) {}

  ngOnInit(): void {
    this.appVersionService.initialize();
  }
}
