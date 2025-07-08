import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { BreakpointObserver } from "@angular/cdk/layout";
import { TranslateService } from "@ngx-translate/core";
import { LanguageSwitcherComponent } from "./public/components/language-switcher/language-switcher.component";
import { RoleService, UserRole} from './iam/services/role.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    LanguageSwitcherComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'OpenNova-Frontend';
  @ViewChild(MatSidenav, { static: true }) sidenav!: MatSidenav;

  private allOptions = [
    { icon: 'dashboard', path: '/dashboard', title: 'Dashboard Renter', roles: ['renter'] },
    { icon: 'dashboard', path: '/owner-dashboard', title: 'Dashboard Owner', roles: ['owner'] },
    { icon: 'directions_car', path: '/publish-vehicle', title: 'Publish Vehicle', roles: ['owner'] },
    { icon: 'book', path: '/my-bookings', title: 'My Bookings', roles: ['renter'] },
    { icon: 'info', path:'/about', title: 'About Us', roles: ['renter', 'owner', 'public'] },
  ];

  visibleOptions: any[] = [];
  currentRole: UserRole = 'public';
  private roleSubscription!: Subscription;

  constructor(
    private translate: TranslateService,
    private observer: BreakpointObserver,
    private roleService: RoleService,
    private router: Router,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    translate.setDefaultLang('en');
    translate.use('en');

    this.matIconRegistry.addSvgIcon(
      'logo-icon', 
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/logo.svg')
    );
      }

  ngOnInit(): void {
    this.roleSubscription = this.roleService.currentRole$.subscribe(role => {
      this.currentRole = role;
      this.updateVisibleOptions();
      // Lógica de redirección (revisar si es demasiado agresiva)
      if (role === 'renter' && this.router.url !== '/dashboard') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'owner' && this.router.url !== '/owner-dashboard') {
        this.router.navigate(['/owner-dashboard']);
      } else if (role === 'public' && this.router.url !== '/select-role') {
        this.router.navigate(['/select-role']);
      }
    });

    this.observer.observe(['(max-width: 1280px)'])
      .subscribe((response) => {
        if (response.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  private updateVisibleOptions(): void {
    this.visibleOptions = this.allOptions.filter(item => {
      return item.roles.includes(this.currentRole) || item.roles.includes('public');
    });
  }

  logout(): void {
    this.roleService.logout();
    this.router.navigate(['/select-role']);
    if (this.sidenav.mode === 'over') {
      this.sidenav.close();
    }
  }
}
