import { Component, OnInit, Input } from '@angular/core';
import { DrawMapZoomIn, DrawMapZoomOut, changeBaseMap } from '../../ESRIMAP'

@Component({
  selector: 'app-parivesh-map',
  templateUrl: './parivesh-map.component.html',
  styleUrls: ['./parivesh-map.component.css']
})

export class GisComponentComponent implements OnInit {
  mapLayer: boolean = false;
  measurementList: boolean = true;
  //{To Access ESRI MapView object}
  @Input() ESRIObject: object = {};
  PariveshGIS: any = {};
  baseLayer() {
    this.mapLayer = !this.mapLayer;
  }
  async ngOnInit() {
    const t: any = this.ESRIObject;
    this.PariveshGIS = await t.PariveshMap;

    this.PariveshGIS.MapView.on("key-down", function (event: any) {
      var keyPressed = event.key;
      if (keyPressed.slice(0, 5) === "Arrow") {
        event.stopPropagation();
      }
    });
    this.PariveshGIS.MapView.on("drag", function (event: any) {
      // prevents panning with the mouse drag event
      //    event.stopPropagation();
      //  console.log(event);
      //this.PariveshGIS.MapView.surface.style.cursor = "default";
    });

  }
  handleBasemapEvent(event: any) {
    changeBaseMap(event, this.PariveshGIS.ArcMap);
  }

  handleMapToolButtons(event: any) {
    const _tool = event.currentTarget.parentElement.title;

    if (_tool === "ZoomIN")
      DrawMapZoomIn(this.PariveshGIS.MapView, undefined);
    else if (_tool === "ZoomOUT")
      DrawMapZoomOut(this.PariveshGIS.MapView, undefined);
    else if (_tool === "Measure") {
      this.measurementList = !this.measurementList;
      const a = document.getElementById("measureTool");
      this.PariveshGIS.MapView.ui.add(a, "top-right");
    }
    else if (_tool === "Extent")
      DrawMapZoomOut(this.PariveshGIS.MapView, undefined);
    else if (_tool === "Previous Extent")
      DrawMapZoomOut(this.PariveshGIS.MapView, undefined);
    else if (_tool === "Next Extent")
      DrawMapZoomOut(this.PariveshGIS.MapView, undefined);
    else if (_tool === "Pan")
      this.PariveshGIS.MapView.surface.style.cursor = "pointer";
    else if (_tool === "Identify")
      DrawMapZoomOut(this.PariveshGIS.MapView, undefined);
  }

  commonClose(event: any) {
    this.measurementList = !this.measurementList;
  }
}
