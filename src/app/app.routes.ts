import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { DispatcherPageComponent } from './dispatcher-page/dispatcher-page.component';
import { UnitPageComponent } from './unit-page/unit-page.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'admin-page', component: AdminPageComponent },
    { path: 'dispatcher-page', component: DispatcherPageComponent },
    { path: 'unit-page', component: UnitPageComponent },   
];
