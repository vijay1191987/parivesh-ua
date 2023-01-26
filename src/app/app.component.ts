import { Component } from '@angular/core';
import { createGISInstance } from './ESRIMAP';
import { PariveshMapComponent } from './components/parivesh-map/parivesh-map.component';
import { CafComponent } from './components/caf/caf.component';
import { DssToolsComponent } from './components/dss-tools/dss-tools.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Parivesh GIS';
  public PariveshMap: Object;
  public qsParams: any;
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.qsParams = params;
    });
    this.PariveshMap = createGISInstance("pariveshMAPdiv");
  }
  onOutletLoaded(component: PariveshMapComponent | CafComponent | DssToolsComponent) {
    component.ESRIObject = this.PariveshMap;
    component.qsData = this.qsParams;
  }
}
