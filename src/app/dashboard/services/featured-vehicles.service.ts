import { Injectable } from '@angular/core';
import { BaseService } from "../../shared/services/base.service";
import { HttpClient } from '@angular/common/http';
import { PublishedVehicles } from '../../navigation/model/published-vehicles.entity';

@Injectable({
  providedIn: 'root'
})

export class FeaturedVehiclesService extends BaseService<PublishedVehicles> {
  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = '/publishedVehicles';
  }
}
