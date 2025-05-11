import { Component } from '@angular/core';
import { FeaturedCardsComponent } from './featured-cards/featured-cards.component';
import { MyPostCardsComponent } from './my-post-cards/my-post-cards.component';
import { ReservedCardsComponent } from './reserved-cards/reserved-cards.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [FeaturedCardsComponent, MyPostCardsComponent, ReservedCardsComponent]
})
export class DashboardComponent {
}
