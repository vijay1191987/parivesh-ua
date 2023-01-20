import { Component } from '@angular/core';
import { createGISInstance } from './ESRIMAP';
import { PariveshMapComponent } from './components/parivesh-map/parivesh-map.component';
import { CafComponent } from './components/caf/caf.component';
import { DssToolsComponent } from './components/dss-tools/dss-tools.component';

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
  onOutletLoaded(component: PariveshMapComponent | CafComponent | DssToolsComponent) {
    component.ESRIObject = this.PariveshMap;
  }
}