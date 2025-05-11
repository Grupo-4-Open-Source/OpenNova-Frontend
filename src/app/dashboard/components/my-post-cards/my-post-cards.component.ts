import { Component, OnInit } from '@angular/core';
import { MyPostService } from '../../services/my-post.service';
import { PublishedVehicles } from '../../../navigation/model/published-vehicles.entity';
import { CurrencyPipe, NgForOf } from '@angular/common';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardTitle
} from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-post-cards',
  templateUrl: './my-post-cards.component.html',
  imports: [
    CurrencyPipe,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardImage,
    MatCardTitle,
    NgForOf
  ],
  styleUrls: ['./my-post-cards.component.css']
})
export class MyPostCardsComponent implements OnInit {
  vehicles: PublishedVehicles[] = [];
  displayedVehicles: PublishedVehicles[] = [];
  limit = 4;

  constructor(
    private myPostService: MyPostService,
    private router: Router) {}

  ngOnInit(): void {
    this.getMyPostVehicles();
  }

  private getMyPostVehicles(): void {
    this.myPostService.getAll().subscribe((response: any) => {
      this.vehicles = response;
      this.displayedVehicles = this.vehicles.reverse().slice(0, this.limit);
    });
  }

  showAll(): void {
    this.router.navigate(['/']);
  }
}
