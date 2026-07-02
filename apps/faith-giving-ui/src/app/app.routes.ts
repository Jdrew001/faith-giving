import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";

export const appRoutes: Route[] = [
    {
        path: '',
        loadChildren: () => import('./sign-in/sign-in.module').then(m => m.SignInModule)
    },
    {
        path: 'give',
        loadChildren: () => import('./giving/giving.module').then(m => m.GivingModule)
    },
    {
        path: '**',
        redirectTo: ''
    }
];

@NgModule({
    imports: [
      RouterModule.forRoot(appRoutes, {}),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
