import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GivingComponent } from "./giving.component";

const routes: Routes = [
    {
      path: '',
      component: GivingComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GivingRoutingModule {
}