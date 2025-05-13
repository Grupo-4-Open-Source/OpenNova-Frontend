import { Injectable } from '@angular/core';
import { BaseService } from "../../shared/services/base.service";
import { HttpClient } from "@angular/common/http";
import { Vehicle } from "../model/vehicle.entity";

@Injectable({
  providedIn: 'root'
})
export class VehiclesService extends BaseService<Vehicle> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = '/vehicles';
  }
}
