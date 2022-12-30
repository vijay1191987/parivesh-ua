import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class PariveshServices {
    constructor(private http: HttpClient) { };
    getGISLayers() {
        return this.http.get("https://stgdev.parivesh.nic.in/ua-dev/gislayer/getlayerslist");
    }
}