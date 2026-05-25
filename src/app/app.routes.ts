import { Routes } from '@angular/router';
import { Email } from './components/email/email';
import { Home } from './components/home/home';

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
    }

];
