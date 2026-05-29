import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatAnchor, MatButtonModule } from "@angular/material/button";
import { JsonPipe, NgIf } from '@angular/common';
import { EmailService } from '../../service/emailService';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { response } from 'express';
import { error } from 'console';


@Component({
  selector: 'app-email',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatAnchor,
    MatButtonModule,
    JsonPipe,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NgIf,    
],
  templateUrl: './email.html',
  styleUrl: './email.css',
})
export class Email {

  constructor(private email: EmailService, private snack: MatSnackBar, private cdr: ChangeDetectorRef, private zone: NgZone) { }

  //   ngOnInit(): void {
  //   // App ke load hote hi yeh automatic trigger ho jayega
  //   this.email.getData().subscribe({
  //     next: (response: any) => {
  //       console.log('Data loaded successfully:', response);
  //     },
  //     error: (error: any) => {
  //       console.error('Error loading data:', error);
  //     }
  //   });
  // }


  flag:boolean= false;

  data = {
    "to": "",
    "subject": "",
    "message": ""
  }

  doSubmitForm() {
    console.log("try to submit form !!");
    console.log("data", this.data);

    if (this.data.to == '' || this.data.subject == '' || this.data.message == '') {
      console.log("inside if")
      this.snack.open("Fields can not be empty !!", "OK");
      return;
    }

    this.flag=true;
      this.email.sendEmail(this.data).subscribe(
      response => {
        
        this.snack.open("Send success...","OK")
        console.log(response);
        window.location.reload(); 

        setTimeout(() => {
          this.flag = false;
        }, 100);
      },
      error => {
        
        this.snack.open("Error","OK");
        console.log(error);
        setTimeout(() => {
          this.flag = false;
        }, 100);

      }

    )

    // this.email.getData().subscribe(
    //   response =>{
    //     console.log(response)
    //   },error => {
    //     console.log(error)
    //   } 
    // )

  }
}
