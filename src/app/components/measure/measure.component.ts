import { Component, Input } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.css']
})
export class MeasureComponent {
  @Input() MapData: any = {};
  PariveshGIS: any = {};
  ESRIObject: object = {};
  ESRIObj_: any = null;
  elevationProfile: any = null;
  elevationShow: boolean = false;

  constructor(private dragable: DragableService) { }

  async elevationIcon(idName: any) {
    this.elevationShow = !this.elevationShow;
    this.dragable.registerDragElement(idName);
    //Map Object
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;   

    if (this.elevationShow) {
      this.elevationProfile = null;
      const rootElem: any = document.getElementById('elevation');
      const d: any = document.createElement('div');
      d.className = 'tool-popup-inner';
      rootElem.appendChild(d)
      const [ElevationProfile, ElevationLayer] = await loadModules(["esri/widgets/ElevationProfile", "esri/layers/ElevationLayer"]);
      const worldElevation = new ElevationLayer({
        url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
        id: "elevationlayer"
      });
      this.PariveshGIS.ArcMap.ground.layers.add(worldElevation);
      
      this.elevationProfile = new ElevationProfile({
        view: this.PariveshGIS.ArcView,
        profiles: [
          {
            type: "ground" // first profile line samples the ground elevation
          },
          {
            type: "view" // second profile samples the view and shows building profiles
          },

        ],
        visibleElements: {
          legend: true,
          chart: true,
          clearButton: true,
          settingsButton: true,
          sketchButton: true,
          selectButton: false,
          uniformChartScalingToggle: true
        },
        container: d // runtime div created
      });
    }
    else {
      if (this.elevationProfile != undefined) {
        this.elevationProfile.destroy(); // to destroy the elevation profile
      }
    }
  }
}
