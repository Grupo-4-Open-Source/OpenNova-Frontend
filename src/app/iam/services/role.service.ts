import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'renter' | 'owner' | 'public';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentRoleSubject: BehaviorSubject<UserRole>;
  public currentRole$: Observable<UserRole>;

  constructor() {
    // Initialize with a default role from localStorage or 'public'
    const storedRole = localStorage.getItem('userRole') as UserRole;
    this.currentRoleSubject = new BehaviorSubject<UserRole>(storedRole || 'public');
    this.currentRole$ = this.currentRoleSubject.asObservable();
  }

  /**
   * Sets the current user role and stores it in localStorage.
   * @param role The role to set.
   */
  setRole(role: UserRole): void {
    localStorage.setItem('userRole', role);
    this.currentRoleSubject.next(role);
    console.log(`Role changed to: ${role}`);
  }

  /**
   * Gets the current user role synchronously.
   * @returns The current user role.
   */
  getRole(): UserRole {
    return this.currentRoleSubject.value;
  }

  /**
   * Logs out the user by resetting the role to 'public'.
   */
  logout(): void {
    localStorage.removeItem('userRole');
    this.currentRoleSubject.next('public');
    console.log('Logged out. Role reset to public.');
  }
}
