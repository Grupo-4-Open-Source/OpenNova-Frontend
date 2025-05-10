import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';
import { PublishedVehicles } from '../../model/published-vehicles.entity';
import { TranslateModule } from "@ngx-translate/core";
import { MatCardModule } from '@angular/material/card';
import {MatTableDataSource} from '@angular/material/table';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-navigation-view',
  imports: [CommonModule, MatCardModule, TranslateModule, MatButton],
  templateUrl: './navigation-interface.component.html',
  styleUrls: ['./navigation-interface.component.css']
})
export class NavigationViewComponent implements OnInit {
  publishedVehiclesData: PublishedVehicles;
  dataSource! : MatTableDataSource<any>;
  isDescending: boolean = true; // Controla el orden
  constructor(private navigationService: NavigationService) {
    this.publishedVehiclesData = {} as PublishedVehicles;
    this.dataSource = new MatTableDataSource<any>();

  }

  private getAllPublishedVehicles(): void {
    this.navigationService.getAll()
      .subscribe((response: any) => {
        this.dataSource.data = response;
      });
  };
  toggleSortOrder(): void {
    this.isDescending = !this.isDescending;
    this.dataSource.data = this.dataSource.data.sort((a, b) =>
      this.isDescending ? b.price - a.price : a.price - b.price
    );
  }
  ngOnInit(): void {
    this.getAllPublishedVehicles();
  }
}

