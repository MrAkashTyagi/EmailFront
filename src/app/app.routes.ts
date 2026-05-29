import { Routes } from '@angular/router';
import { Email } from './components/email/email';
import { Home } from './components/home/home';
import { GuestComponent } from './components/guest/guest';
import { AddGuestComponent } from './components/add-guest/add-guest';
import { Family } from './components/family/family';



export const routes: Routes = [

    {
        path:"sendemail",
        component:Email,
        pathMatch:"full"
    },

    {
        path:"",
        component:Home,
        pathMatch:"full"
    },
    {
        path:"guests",
        component:GuestComponent,
        pathMatch:"full"
    },
     {
        path:"addguest",
        component:AddGuestComponent,
        pathMatch:"full"
    },
    {
        path:"family",
        component:Family,
        pathMatch:"full"
    }

];
