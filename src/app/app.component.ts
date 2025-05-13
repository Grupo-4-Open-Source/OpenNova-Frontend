import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { BreakpointObserver } from "@angular/cdk/layout";
import { TranslateService } from "@ngx-translate/core";
import { LanguageSwitcherComponent } from "./public/components/language-switcher/language-switcher.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule,
    MatSidenavModule, MatDividerModule, MatListModule, LanguageSwitcherComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'OpenNova-Frontend';

  @ViewChild(MatSidenav, {static: true}) sidenav!: MatSidenav;
  options = [
    { icon: 'home', path: '/home', title: 'Home'},
//    { icon: 'person', path: '/publications/vehicles', title: 'Vehicles'},
    { icon: 'info', path:'/about', title: 'About'}
  ];

  constructor(private translate: TranslateService, private observer: BreakpointObserver) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit(): void {
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
}
