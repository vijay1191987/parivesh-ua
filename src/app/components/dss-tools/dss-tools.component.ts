import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dss-tools',
  templateUrl: './dss-tools.component.html',
  styleUrls: ['./dss-tools.component.css']
})
export class DssToolsComponent {
  //{To Access ESRI MapView object}
  @Input() ESRIObject: object = {};
  PariveshGIS: any = {};  

  async ngOnInit() {
    const t: any = this.ESRIObject;
    this.PariveshGIS = await t.PariveshMap;

  }

}
