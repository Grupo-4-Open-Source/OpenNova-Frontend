import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService} from '../../shared/services/base.service';
import { Insurance} from '../model/insurance.entity';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService extends BaseService<Insurance> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = environment.insurancesEndpointPath;
  }

  /**
   * Obtiene todos los planes de seguro desde el backend.
   * @param params Parámetros HTTP opcionales para filtrar.
   * @returns Un Observable que emite un array de objetos Insurance.
   */
  getAllInsurances(params?: HttpParams): Observable<Insurance[]> {
    return this.getAll(params).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar todos los planes de seguro:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un plan de seguro específico por su ID.
   * @param id El ID del plan de seguro.
   * @returns Un Observable que emite el objeto Insurance, o undefined si no se encuentra o hay un error.
   */
  getInsuranceById(id: string): Observable<Insurance | undefined> {
    return this.getById(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar plan de seguro ${id}:`, err);
        return of(undefined);
      })
    );
  }

  /**
   * Crea un nuevo plan de seguro.
   * @param insurance Los datos del plan de seguro a crear (sin el ID).
   * @returns Un Observable que emite el objeto Insurance creado.
   */
  createInsurance(insurance: Omit<Insurance, 'id'>): Observable<Insurance> {
    return this.create(insurance).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al crear plan de seguro:', err);
        throw err;
      })
    );
  }

  /**
   * Actualiza un plan de seguro existente.
   * @param id El ID del plan de seguro a actualizar.
   * @param insurance Los datos actualizados del plan de seguro.
   * @returns Un Observable que emite el objeto Insurance actualizado.
   */
  updateInsurance(id: string, insurance: Partial<Insurance>): Observable<Insurance> {
    return this.update(id, insurance).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al actualizar plan de seguro ${id}:`, err);
        throw err;
      })
    );
  }

  /**
   * Elimina un plan de seguro por su ID.
   * @param id El ID del plan de seguro a eliminar.
   * @returns Un Observable que emite la respuesta de la eliminación.
   */
  deleteInsurance(id: string): Observable<any> {
    return this.delete(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al eliminar plan de seguro ${id}:`, err);
        throw err;
      })
    );
  }
}
