import { Component, OnInit, Input } from '@angular/core';
import { LayersComponent, LayerNode } from './../layers/layers.component'
import { loadModules } from 'esri-loader';
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})


export class LegendComponent implements OnInit {
  //{To Access ESRI MapView object}
  @Input() ESRIObject: object = {};
  PariveshGIS: any = {};

  constructor(private parivesh: PariveshServices) { } //mention the service in constructor

  legendShow: boolean = false;
  async legendIcon() {
    if (!this.legendShow) {
      const [Legend] = await loadModules(["esri/widgets/Legend"]);
      let legend = new Legend({
        view: this.PariveshGIS.MapView,
        container: document.getElementById("legendDIV"),
        style: {
          type: "classic",
          layout: "auto"
        }
      });
      const t: any = this.ESRIObject;
      this.PariveshGIS = await t.PariveshMap;
      this.PariveshGIS.MapView.ui.add(legend, "bottom-right");
    }
    this.legendShow = !this.legendShow;
  }

  ngOnInit(): void {

  }

}
