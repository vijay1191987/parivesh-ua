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
  qsData: object = {};

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

  constructor() {

  }
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
    const [reactiveUtils, Expand, Legend] = await loadModules(["esri/core/reactiveUtils", "esri/widgets/Expand", "esri/widgets/Legend"]);
    this.PariveshGIS.ArcView.on("key-down", function (event: any) {
      var keyPressed = event.key;
      if (keyPressed.slice(0, 5) === "Arrow") {
        event.stopPropagation();
      }
    });
    this.PariveshGIS.ArcView.on("drag", function (event: any) {
      // prevents panning with the mouse drag event
      //    event.stopPropagation();
      // console.log(event);
      //this.PariveshGIS.ArcView.surface.style.cursor = "default";
    });

    reactiveUtils.watch(
      () => [this.PariveshGIS.ArcView.stationary, this.PariveshGIS.ArcView.extent],
      ([stationary, extent]: any, [wasStationary]: any) => {
        if (stationary && this.previousMapExtent != null) {
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

    //Identify Layers
    // Listen for any layer being added or removed in the Map
    this.PariveshGIS.ArcMap.allLayers.on("before-add", function (event: any) {
      if (event.item.type === "map-image") {
        _this.PariveshGIS.ArcView.whenLayerView(event.item).then(function (lv: any) {
          lv.layer.sublayers.forEach(function (sublayer: any) {
            sublayer.createFeatureLayer()
              .then((featureLayer: any) => featureLayer.load())
              .then((featureLayer: any) => {
                const _template = featureLayer.createPopupTemplate();
                const _modified = _template.fieldInfos.filter((field: any) => {
                  if (field.fieldName.includes('de11'))
                    field.visible = false;
                  if (field.fieldName.includes('_code'))
                    field.visible = false;
                  if (field.fieldName.includes('_lgd'))
                    field.visible = false;
                  if (field.fieldName.includes('code'))
                    field.visible = false;
                  return field;
                });
                _template.fieldInfos = _modified;
                sublayer.popupTemplate = _template;
              })
          });
        });
      }
    });
    //Identify Ends
    const _legend = new Legend({
      view: this.PariveshGIS.ArcView,
      label: "Map Legends"
    });

    const layerListExpand = new Expand({
      expandIconClass: "esri-icon-legend",
      view: this.PariveshGIS.ArcView,
      container: document.createElement("div"),
      content: _legend,
      label: "Map Legends",
      expandTooltip: "Map Legends"
    });

    this.PariveshGIS.ArcView.ui.add(layerListExpand, "bottom-right");
  }



  baseLayer() {
    this.mapLayer = !this.mapLayer;
  }

  handleBasemapEvent(event: any) {
    changeBaseMap(event, this.PariveshGIS.ArcMap);
    this.mapLayer = false;
  }

  handleMapToolButtons(event: any) {
    const _tool = event.currentTarget.parentElement.title;

    if (_tool === "ZoomIN")
      DrawMapZoomIn(this.PariveshGIS.ArcView, undefined);
    else if (_tool === "ZoomOUT")
      DrawMapZoomOut(this.PariveshGIS.ArcView, undefined);
    else if (_tool === "Measure") {
      this.measurementList = !this.measurementList;
      const a = document.getElementById("measureTool");
      this.PariveshGIS.ArcView.ui.add(a, "top-right");
    }
    else if (_tool === "Extent") {
      const kmlLayer = this.PariveshGIS.ArcMap.findLayerById('EsriUserMap');
      this.PariveshGIS.ArcView.goTo({ target: kmlLayer.graphics.items });
    }

    else if (_tool === "Previous Extent")
      this.zoomPreviousExtent();
    else if (_tool === "Next Extent")
      this.zoomNextExtent();
    else if (_tool === "Pan")
      this.PariveshGIS.ArcView.surface.style.cursor = "pointer";
    else if (_tool === "Identify")
      DrawMapZoomOut(this.PariveshGIS.ArcView, undefined);
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
      this.PariveshGIS.ArcView.goTo({ target: lastEx });
    }
  }
  zoomNextExtent() {
    this.PariveshGIS.ArcView.goTo({ target: this.mapExtent[0] });
  }
  //measurement tool start-------
  KmlMeasurement(event: any, data: any) {
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
          view: this.PariveshGIS.ArcView,
          unit: "kilometers"
        });

        activeWidget.viewModel.start();
        activeWidget.watch("viewModel.measurement", function (measurement: any) {
          _this.MeasurementValue = measurement.length * 0.001;
        });
        // this.PariveshGIS.ArcView.ui.add(activeWidget, "bottom-right");
        this.setActiveButton(document.getElementById("distanceButton"));
        break;
      case "area":

        _this.MeasurementdistanceMeter = true;
        _this.MeasurementareaMeter = false;

        activeWidget = new AreaMeasurement2D({
          view: this.PariveshGIS.ArcView,
          unit: "square-kilometers"
        });
        // skip the initial 'new measurement' button
        activeWidget.viewModel.start();

        activeWidget.watch("viewModel.measurement", function (areameasurement: any) {
          _this.MeasurementAreaValue = areameasurement.area * 0.001;
          _this.MeasurementPerimeterValue = areameasurement.perimeter * 0.001;
        });

        // this.PariveshGIS.ArcView.ui.add(activeWidget, "bottom-right");
        this.setActiveButton(document.getElementById("areaButton"));
        break;
      case null:
        if (activeWidget) {
          this.PariveshGIS.ArcView.ui.remove(activeWidget);
          // activeWidget.destroy();
          activeWidget = null;
        }
        break;
    }
  }
  setActiveButton(selectedButton: any) {
    this.PariveshGIS.ArcView.focus();
    var elements = document.getElementsByClassName("active");
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove("active");
    }
    if (selectedButton) {
      selectedButton.classList.add("active");
    }
  }
}
