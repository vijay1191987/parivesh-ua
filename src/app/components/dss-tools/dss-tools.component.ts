import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dss-tools',
  templateUrl: './dss-tools.component.html',
  styleUrls: ['./dss-tools.component.css']
})
export class DssToolsComponent {
  //{To Access ESRI MapView object}
  ESRIObject: object = {};
  ESRIObj_: object = {};

  async ngOnInit() {
    this.ESRIObj_ = this.ESRIObject;
  }

}
