import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-cancel-dialog',
  standalone: true,
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.css'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    NgIf
  ]
})
export class CancelDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  confirmCancel(): void {
    this.dialogRef.close(true);
  }
}
