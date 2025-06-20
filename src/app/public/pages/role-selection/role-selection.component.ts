import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RoleService, UserRole} from '../../../iam/services/role.service';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="role-selection-container">
      <div class="role-selection-card">
        <div class="logo">
          <mat-icon class="logo-icon" svgIcon="logo-icon"></mat-icon> <div class="logo-text">
            <span class="company-name">OpenNova</span>
            <span class="company-slogan">Your ultimate vehicle rental platform</span>
          </div>
        </div>

        <h2>Select Your Role</h2>
        <p class="description">Please choose your role to access the appropriate dashboard.</p>

        <div class="role-buttons">
          <button mat-raised-button color="primary" class="role-button"
                  [class.selected]="selectedRole === 'renter'"
                  (click)="selectRole('renter')">
            <mat-icon>person</mat-icon>
            <span>Renter</span>
          </button>

          <button mat-raised-button color="primary" class="role-button"
                  [class.selected]="selectedRole === 'owner'"
                  (click)="selectRole('owner')">
            <mat-icon>store</mat-icon>
            <span>Owner</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./role-selection.component.css']
})
export class RoleSelectionComponent implements OnInit {
  selectedRole: UserRole | null = null;

  constructor(private roleService: RoleService, private router: Router) {}

  ngOnInit(): void {
    this.selectedRole = this.roleService.getRole();
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.roleService.setRole(role);

    if (role === 'renter') {
      this.router.navigate(['/dashboard']);
    } else if (role === 'owner') {
      this.router.navigate(['/owner-dashboard']);
    }
  }
}
