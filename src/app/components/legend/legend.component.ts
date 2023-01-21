import { Component, OnInit, Input } from '@angular/core';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})


export class LegendComponent implements OnInit {
  //{To Access ESRI MapView object}
  @Input() MapData: object = {};
  PariveshGIS: any = {};

  legendShow: boolean = false;
  async legendIcon() {
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
    if (!this.legendShow) {
      const [Legend] = await loadModules(["esri/widgets/Legend"]);
      let legend = new Legend({
        view: this.PariveshGIS.ArcView,
        container: document.getElementById('legendDIV')
      });
      this.PariveshGIS.ArcView.ui.add(legend, "bottom-right");
    }
    this.legendShow = !this.legendShow;
  }

  ngOnInit(): void {

  }

}
