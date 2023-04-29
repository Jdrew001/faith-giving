import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";

export const appRoutes: Route[] = [
    {
        path: "", redirectTo: '/', pathMatch: 'full'
    },
    {
        path: "", loadChildren: () => import('./giving/giving.module').then(m => m.GivingModule) 
    }
];

@NgModule({
    imports: [
      RouterModule.forRoot(appRoutes, {}),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
