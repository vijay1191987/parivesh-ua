import { Component } from '@angular/core';
import { createGISInstance } from './ESRIMAP'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Parivesh GIS';
  public PariveshMap: Object;
  constructor() {
    this.PariveshMap = createGISInstance("pariveshMAPdiv");
  }
}