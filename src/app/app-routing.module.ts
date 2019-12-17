import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './common/landing/landing.component'
import { AppCustomPreloader } from './app-routing-loader';

const routes: Routes = [

  { path: '', redirectTo:'account',pathMatch: 'full'},
  { path: 'account', loadChildren: "./account/account.module#AccountModule" },
  { path:'landing',component:LandingComponent}, 
  { path: 'home', loadChildren: "./portal-home/portal-home.module#PortalHomeModule"},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true })],
  exports: [RouterModule],
  providers: [AppCustomPreloader]
})
export class AppRoutingModule { }
