import { Component, OnInit, Input } from '@angular/core';
import { DrawMapZoomIn, DrawMapZoomOut, changeBaseMap } from '../../ESRIMAP'
import { loadModules } from 'esri-loader';

let _this: any = null;

@Component({
  selector: 'app-parivesh-map',
  templateUrl: './parivesh-map.component.html',
  styleUrls: ['./parivesh-map.component.css']
})

export class PariveshMapComponent implements OnInit {
  mapLayer: boolean = false;
  measurementList: boolean = true;
  MeasurementValue: any;
  MeasurementAreaValue: any;
  MeasurementPerimeterValue: any;
  MeasurementdistanceMeter: boolean = true;
  MeasurementareaMeter: boolean = true;
  mapExtent: any = null;
  NextExtent: any = null;
  previousMapExtent: any = null;

  //{To Access ESRI MapView object}
  @Input('MapData') MapData: any = null;
  ESRIObject: object = {};
  ESRIObj_: any = null;
  PariveshGIS: any = {};

  async ngOnInit() {
    _this = this;
    if (this.MapData === null) {
      this.ESRIObj_ = this.ESRIObject;
      this.PariveshGIS = await this.ESRIObject;
    }
    else {
      this.ESRIObj_ = this.MapData;
      const t: any = this.MapData;
      this.PariveshGIS = await t.ESRIObj_;
    }
    this.mapExtent = [];
    this.NextExtent = [];
    const [reactiveUtils] = await loadModules(["esri/core/reactiveUtils"]);
    this.PariveshGIS.MapView.on("key-down", function (event: any) {
      var keyPressed = event.key;
      if (keyPressed.slice(0, 5) === "Arrow") {
        event.stopPropagation();
      }
    });
    this.PariveshGIS.MapView.on("drag", function (event: any) {
      // prevents panning with the mouse drag event
      //    event.stopPropagation();
      console.log(event);
      //this.PariveshGIS.MapView.surface.style.cursor = "default";
    });

    reactiveUtils.watch(
      () => [this.PariveshGIS.MapView.stationary, this.PariveshGIS.MapView.extent],
      ([stationary, extent]: any, [wasStationary]: any) => {
        if (stationary) {
          let dTest = Math.abs(extent.xmax - extent.xmin);
          let dFactor = dTest / 100;
          if (Math.abs(extent.xmax - this.previousMapExtent.xmax) > dFactor ||
            Math.abs(extent.xmin - this.previousMapExtent.xmin) > dFactor ||
            Math.abs(extent.ymax - this.previousMapExtent.ymax) > dFactor ||
            Math.abs(extent.ymin - this.previousMapExtent.ymin) > dFactor)
            _this.mapExtent.push(extent);
          if (_this.mapExtent.length > 40)
            _this.mapExtent.shift();
          this.previousMapExtent = extent;
        }
        else if (wasStationary) {
          this.previousMapExtent = extent;
        }
      }
    );
  }

  baseLayer() {
    this.mapLayer = !this.mapLayer;
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
  zoomPreviousExtent() {
    if (this.mapExtent.length > 1) {
      this.mapExtent.pop();
      let lastEx = this.mapExtent[this.mapExtent.length - 1];
      let a = this.mapExtent.pop();
      this.NextExtent.push(a);
      this.PariveshGIS.MapView.goTo({ target: lastEx });
    }
  }
  zoomNextExtent() {
    this.PariveshGIS.MapView.goTo({ target: this.mapExtent[0] });
  }
  //measurement tool start-------
  KmlMeasurement(event: any, data: any) {

    // this.PariveshGIS.MapView.ui.add("topbar", "bottom-left");

    if (data == 'distance') {

      this.setActiveWidget(null);

      if (!event.target.className.includes('active')) {
        this.setActiveWidget("distance");
      } else {
        this.setActiveButton(null);
      }
    } else if (data == 'area') {
      this.setActiveWidget(null);
      if (!event.target.className.includes("active")) {
        this.setActiveWidget("area");
        unit: "square-kilometers"
      } else {
        this.setActiveButton(null);
      }
    }
  }
  async setActiveWidget(event: any) {
    let activeWidget = null;
    const [DistanceMeasurement2D, AreaMeasurement2D] = await loadModules(["esri/widgets/DistanceMeasurement2D", "esri/widgets/AreaMeasurement2D"]);
    switch (event) {
      case "distance":
        _this.MeasurementdistanceMeter = false;
        _this.MeasurementareaMeter = true;
        activeWidget = new DistanceMeasurement2D({
          view: this.PariveshGIS.MapView,
          unit: "kilometers"
        });

        activeWidget.viewModel.start();
        activeWidget.watch("viewModel.measurement", function (measurement: any) {
          _this.MeasurementValue = measurement.length * 0.001;
        });
        // this.PariveshGIS.MapView.ui.add(activeWidget, "bottom-right");
        this.setActiveButton(document.getElementById("distanceButton"));
        break;
      case "area":

        _this.MeasurementdistanceMeter = true;
        _this.MeasurementareaMeter = false;

        activeWidget = new AreaMeasurement2D({
          view: this.PariveshGIS.MapView,
          unit: "square-kilometers"
        });
        // skip the initial 'new measurement' button
        activeWidget.viewModel.start();

        activeWidget.watch("viewModel.measurement", function (areameasurement: any) {
          _this.MeasurementAreaValue = areameasurement.area * 0.001;
          _this.MeasurementPerimeterValue = areameasurement.perimeter * 0.001;
        });

        // this.PariveshGIS.MapView.ui.add(activeWidget, "bottom-right");
        this.setActiveButton(document.getElementById("areaButton"));
        break;
      case null:
        if (activeWidget) {
          this.PariveshGIS.MapView.ui.remove(activeWidget);
          // activeWidget.destroy();
          activeWidget = null;
        }
        break;
    }
  }
  setActiveButton(selectedButton: any) {
    this.PariveshGIS.MapView.focus();
    var elements = document.getElementsByClassName("active");
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove("active");
    }
    if (selectedButton) {
      selectedButton.classList.add("active");
    }
  }
}
