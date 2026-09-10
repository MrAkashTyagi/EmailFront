import { Routes } from '@angular/router';
import { Email } from './components/email/email';
import { Home } from './components/home/home';
import { GuestComponent } from './components/guest/guest';
import { AddGuestComponent } from './components/add-guest/add-guest';
import { Family } from './components/family/family';
import { Expense } from './expense/expense';
import { Dashboard } from './components/dashboard/dashboard';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { authGuard } from './auth-guard';



export const routes: Routes = [

    {
        path: "sendemail",
        component: Email,
        pathMatch: "full"
    },

    {
        path: "",
        component: Home,
        pathMatch: "full"
    },
    {
        path: "guests",
        component: GuestComponent,
        pathMatch: "full",
        // canActivate: [authGuard]
    },
    {
        path: "addguest",
        component: AddGuestComponent,
        pathMatch: "full",
        // canActivate: [authGuard]
    },
    {
        path: "family",
        component: Family,
        pathMatch: "full",
        // canActivate: [authGuard]
    },
    {
        path: "expenses",
        component: Expense,
        pathMatch: "full",
        // canActivate: [authGuard]
    },
    {
        path: "dashboard",
        component: Dashboard,
        pathMatch: "full",
        // canActivate: [authGuard]
    },
    {
        path: "register",
        component: Register,
        pathMatch: "full"
    },
    {
        path: "login",
        component: Login,
        pathMatch: "full"
    }

];
