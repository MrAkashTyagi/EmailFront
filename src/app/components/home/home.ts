import { Component, inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'home',
  imports: [
    MatButtonModule,
    MatSnackBarModule,
    RouterLink
],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

private snackBar = inject(MatSnackBar);

constructor(private matSnack: MatSnackBar){

}

   onClick() {
    this.matSnack.open('Compose Your email !!', 'Dismiss',{

      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'

    });
  }

}
