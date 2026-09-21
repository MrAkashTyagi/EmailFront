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
import { Wall } from './components/wall/wall';

import {
    guestAccessGuard
} from './guest-access-guard';

export const routes: Routes = [

    {
        path: "sendemail",
        component: Email,
        pathMatch: "full",
        canActivate: [authGuard, guestAccessGuard]
    },

    {
        path: "",
        component: Login,
        pathMatch: "full"
    },
    {
        path: "guests",
        component: GuestComponent,
        pathMatch: "full",
        canActivate: [authGuard, guestAccessGuard]
    },
    {
        path: "addguest",
        component: AddGuestComponent,
        pathMatch: "full",
        canActivate: [authGuard, guestAccessGuard]
    },
    {
        path: "family",
        component: Family,
        pathMatch: "full",
        canActivate: [authGuard, guestAccessGuard]
    },
    {
        path: "expenses",
        component: Expense,
        pathMatch: "full",
        canActivate: [authGuard, guestAccessGuard]
    },
    {
        path: "dashboard",
        component: Dashboard,
        pathMatch: "full",
        canActivate: [authGuard, guestAccessGuard]
    },
    {
        path: "wall",
        component: Wall,
        pathMatch: "full",
        canActivate: [authGuard]
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
    },

];
