import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { AppRoutingModule, appRoutes } from "./app.routes";
import { NxWelcomeComponent } from "./nx-welcome.component";
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
