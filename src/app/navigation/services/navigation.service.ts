import { Injectable } from '@angular/core';

import { BaseService } from "../../shared/services/base.service";
import { HttpClient } from "@angular/common/http";
import {PublishedVehicles} from '../model/published-vehicles.entity';

@Injectable({
  providedIn: 'root'
})
export class NavigationService extends BaseService<PublishedVehicles>{

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = '/publishedVehicles';
  }}
