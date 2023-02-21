import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { loadModules } from 'esri-loader';
import { fetchDataEsriService, createFillSymbol, getUserKMLFromTree, CreateEsrisymbol } from "./../gisHelper";
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
import { Bharatmaps } from "../gisHelper/localConfigs";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TableComponent } from 'src/app/commonComponents/table/table.component';

let that: any;

@Component({
  selector: 'app-buffer',
  templateUrl: 'buffer.component.html',
  styleUrls: ['buffer.component.css']
})

export class BufferComponent {
  dropdownList: any = [];
  selectedItems: any = [];

  bufferShow: boolean = false;
  //{To Access ESRI MapView object}
  @Input() MapData: any = {};
  @Input() dssLayerTool: any;
  proposalAllKMLs: any = [];
  i: any = 2;
  PariveshGIS: any = {};
  selectBufferType: any = [];
  selectedSourceLayer: any = [];
  selectedItems_Decision: any = [];
  //selectedItems_Decision: any = [];
  isSelectfeature: boolean = true;
  isSelectDraw: boolean = true;
  decisionLayers: any[] = [];
  bufferType = [{ item_id: 1, item_text: "Select by Feature" }, { item_id: 2, item_text: "Draw by Feature" }];
  bufferUnits = [{ unit: "kilometers", val: "KILOMETER" }];
  relType = [{ item_id: "intersects", item_text: "intersects" }, { item_id: "contains", item_text: "contains" }];
  splRelType: any = null;
  _bufferResults: any[] = [];
  _sourceLayer: any = {};
  selectedBufferUnit: any = [];
  sketchViewModel: any = null;
  sketchLayer: any = null;
  bufferNumSlider: any = null;
  sketchGeometry: any = null;
  filterGeometry: any = null;
  bufferSize: any = 0;
  bufferLayer: any = null;
  featureLayerView: any = null;
  sceneLayerView: any = null;

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true
  };

  dropdownSettings_1: IDropdownSettings = {
    singleSelection: true,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true
  };

  constructor(private dragable: DragableService, private parivesh: PariveshServices, private bottomSheet: MatBottomSheet) {
    this.parivesh.currentLayerTreeData.subscribe(layerData => {
      if (layerData.length > 0) {
        if (layerData[0].hasOwnProperty('selected')) {
          const _data = getUserKMLFromTree(layerData[0]);
          let userkmls = [...new Set([..._data[0], ..._data[1]])];
          for (let index = 0; index < userkmls.length; index++) {
            const f = { item_id: index, item_text: userkmls[index] };
            this.proposalAllKMLs.push(f);
          }
        }
        else {
          const dl: any[] = layerData.filter((element: any) => element.decision_layer == true);
          for (let index = 0; index < dl.length; index++) {
            this.decisionLayers.push({ item_id: dl[index].ggllayerid, item_text: dl[index].layernm, item_url: dl[index].layerurl });
          }
        }
      }
    });
  }
  async bufferIcon(idName: any) {
    that = this;
    this.bufferShow = !this.bufferShow;
    this.dragable.registerDragElement(idName);
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
  }

  onItemSelect(data: any) {
    const _gl = this.PariveshGIS.ArcMap.layers.items.filter(function (_d: any) {
      if (_d.title === data.item_text)
        return _d;
    });
    this._sourceLayer = _gl[0];
    this.PariveshGIS.ArcView.goTo({
      target: _gl[0].graphics.items[0].geometry,
      extent: _gl[0].graphics.items[0].geometry.extent.clone().expand(1.8)
    });
    this.PariveshGIS.ArcView.popup.open({
      features: _gl[0].graphics.items,
      location: _gl[0].graphics.items[0].geometry.type === "polygon" ? _gl[0].graphics.items[0].geometry.centroid : _gl[0].graphics.items[0].geometry.extent.center
    });
  }

  onSelectAll(items: any) {
    this.selectedItems_Decision = [];
    if (items.length === 0)
      this.selectedItems_Decision = [];
    items.forEach((element: any) => {
      this.selectedItems_Decision.push(element.item_id);
    });

  }

  onItemDeSelect(data: any) {
    this.selectedItems_Decision.forEach((element: any, i: any) => {
      const jsonKey = Object.keys(element);
      if (data.item_id === parseInt(jsonKey[0]))
        this.selectedItems_Decision.splice(i, 1);
    });
  }

  async eventbufferfeature(data: any) {
    if (data.item_id == 1) {
      this.isSelectfeature = false;
      this.isSelectDraw = true;
    }
    else {
      if (this.selectedItems_Decision.length > 0)
        this.selectedItems_Decision = null;

      var input: any = document.getElementById('showInputField');
      input.innerHTML = '';
      this.isSelectDraw = false;
      this.isSelectfeature = true;

      const [GraphicsLayer, SketchViewModel, Slider] = await loadModules(["esri/layers/GraphicsLayer", "esri/widgets/Sketch/SketchViewModel", "esri/widgets/Slider"]);
      this.sketchLayer = new GraphicsLayer();
      this.bufferLayer = new GraphicsLayer();
      //this.PariveshGIS.ArcMap.addMany([this.sketchLayer, this.bufferLayer]);
      let bufferNum: any = document.getElementById('bufferNum');
      bufferNum.innerHTML = '';
      this.bufferNumSlider = new Slider({
        container: "bufferNum",
        min: 0,
        max: 50,
        steps: 1,
        visibleElements: {
          labels: true
        },
        precision: 0,
        labelFormatFunction: (value: any, type: any) => {
          return `${value.toString()}KM`;
        },
        values: [0]
      });

      this.sketchViewModel = new SketchViewModel({
        layer: this.sketchLayer,
        view: this.PariveshGIS.ArcView,
        pointSymbol: {
          type: "simple-marker",
          style: "circle",
          size: 10,
          color: [255, 255, 255, 0.8],
          outline: {
            color: [211, 132, 80, 0.7],
            size: 10
          }
        },
        polylineSymbol: {
          type: "simple-line",
          color: "cyan",
          width: 3
        },
        polygonSymbol: {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: "#F2BC94",
          style: 'none',
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: "cyan",
            width: 3
          }
        },
        defaultCreateOptions: { hasZ: false }
      });

      this.sketchViewModel.on(["create"], (event: any) => {
        // update the filter every time the user finishes drawing the filtergeometry
        if (event.state == "complete") {
          this.sketchGeometry = event.graphic.geometry;
          this.updateFilter();
        }
      });

      this.sketchViewModel.on(["update"], (event: any) => {
        const eventInfo = event.toolEventInfo;
        // update the filter every time the user moves the filtergeometry
        if (
          event.toolEventInfo &&
          event.toolEventInfo.type.includes("stop")
        ) {
          this.sketchGeometry = event.graphics[0].geometry;
          this.updateFilter();
        }
      });
      this.bufferNumSlider.on(
        ["thumb-change", "thumb-drag"],
        this.bufferVariablesChanged
      );
    }
  }

  addBufferRow() {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    const node: any = document.createElement("div");
    node.className = 'mb-3';
    const labelNode: any = document.createElement("label");
    labelNode.className = 'mb-1 d-flex align-items-center';
    labelNode.innerText = "Buffer Value";
    const colorNode: any = document.createElement("p");
    colorNode.className = 'ms-2 mb-0 p-0 rounded';
    colorNode.style = "width: 20px;height: 20px; background-color:" + randomColor + "";
    colorNode.style.backgroundColor = randomColor;
    colorNode.id = "colorPra_" + this.i;
    const inputNode: any = document.createElement("input");
    inputNode.type = "number";
    inputNode.name = "bufferVal";
    inputNode.className = 'form-control';
    inputNode.id = "bufferTool_" + this.i;
    labelNode.appendChild(colorNode);
    node.appendChild(labelNode);
    node.appendChild(inputNode);
    let xt: any = document.getElementById("showInputField");
    xt.appendChild(node);
    this.i++;
  }

  clearFormFields() {
    for (let index = 0; index < this.selectedItems_Decision.length; index++) {
      let _lyr = this.PariveshGIS.ArcMap.findLayerById(this.selectedItems_Decision[index].item_text);
      this.PariveshGIS.ArcMap.layers.remove(_lyr);
    }
    this._bufferExecution = "Execute";
    this._bufferResults = [];
    this.selectBufferType = null;
    this.selectedSourceLayer = null;
    this.selectedItems_Decision = null;
    this.selectedBufferUnit = null;
    var input: any = document.getElementsByName('bufferVal');
    for (let i = 0; i < input.length; i++) {
      input[i].value = null;
    }
    this.PariveshGIS.ArcView.graphics.removeAll();
    this.clearBufferFilter();
  }

  async executeBuffer() {
    this._bufferResults = [];
    const [Graphic, Query, geometryService, BufferParameters, FeatureLayer] = await loadModules(["esri/Graphic", "esri/rest/support/Query", "esri/rest/geometryService", "esri/rest/support/BufferParameters", "esri/layers/FeatureLayer"]);
    if (this.selectedItems_Decision.length == null || this.selectedItems_Decision.length == undefined)
      alert("Please select atleast one decision layer.")
    if (this.selectedSourceLayer == null || this.selectedSourceLayer == '')
      alert("Please select source layer.")
    else {
      var input: any = document.getElementsByName('bufferVal');
      const _bufferDistance = [];
      const bufferparams = new BufferParameters({
        distances: [],
        unit: this.selectedBufferUnit,
        geodesic: true,
        bufferSpatialReference: { wkid: 4326 },
        outSpatialReference: { wkid: 4326 },
        geometries: [this._sourceLayer.graphics._items[0].geometry]
      });
      for (let i = 0; i < input.length; i++) {
        const bufferValue = Number((<HTMLInputElement>input[i]).value);
        _bufferDistance.push(bufferValue);
      }

      bufferparams.distances = _bufferDistance;
      const _gs = await geometryService.buffer("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer", bufferparams);
      let esriRes = [];
      for (let i = 0; i < _gs.length; i++) {
        const bufferColor: any = document.getElementById('colorPra_' + Number(i + 1));
        const _bufferGraphics = new Graphic({
          geometry: _gs[i],
          symbol: createFillSymbol([255, 182, 193, 0.9], "backward-diagonal", 2, bufferColor.style.backgroundColor)
        });
        this.PariveshGIS.ArcView.graphics.add(_bufferGraphics);

        for (let index = 0; index < this.selectedItems_Decision.length; index++) {
          esriRes = [];
          const dt = this.decisionLayers.filter((element) => element.item_id == this.selectedItems_Decision[index].item_id);
          let layer_ID = dt[0].item_url.split('/').pop();
          const featUrl = !isNaN(layer_ID) ? dt[0].item_url.trim() : dt[0].item_url.trim() + '/' + this.selectedItems_Decision[index].item_id;
          const _lyr = new FeatureLayer({
            id: this.selectedItems_Decision[index].item_text,
            url: featUrl,
            apiKey: Bharatmaps,
            visible: false
          });
          const q = new Query();
          q.returnGeometry = true;
          q.outFields = ["*"];
          q.geometry = _gs[i];
          q.spatialRelationship = "intersects";
          const response = await fetchDataEsriService(q, _lyr);
          let matched: any = this._bufferResults.filter(elem => elem.TargetLayer == this.selectedItems_Decision[index].item_text);
          if (matched.length > 0) {
            matched[0].Results.push({ BufferDistance: _bufferDistance[i], Feat: response.features });
            esriRes = matched[0].Results;
          }
          else
            esriRes.push({ BufferDistance: _bufferDistance[i], Feat: response.features });
          const _json = { TargetLayer: this.selectedItems_Decision[index].item_text, BufferValue: _bufferDistance, Results: esriRes, tabEnable: true };
          if (this._bufferResults.length > 0) {
            if (matched.length > 0) {
              let _ix = this._bufferResults.findIndex(obj => obj.TargetLayer == _json.TargetLayer);
              this._bufferResults.splice(_ix, 1);
            }
          }
          this._bufferResults.push(_json);
        }
      }
      this.showResultBottomSheet();
    }
  }

  _bufferExecution: string = "Execute";
  showResultBottomSheet() {
    if (this._bufferResults.length > 0) {
      this._bufferExecution = "Show Result";
      this.bottomSheet.dismiss();
      this.bottomSheet.open(TableComponent, {
        data: { rowData: this._bufferResults, pariveshGIS: this.PariveshGIS },
        hasBackdrop: false,
        closeOnNavigation: false,
        disableClose: true,
      });
    }
    else {
      this.bottomSheet.dismiss();
      this.executeBuffer();
    }
  }

  bufferVariablesChanged(event: any) {
    that.bufferSize = event.value;
    that.updateFilterGeometry();
  }

  clearBufferFilter() {
    this.sketchGeometry = null;
    this.filterGeometry = null;
    this.sketchLayer.removeAll();
    this.bufferLayer.removeAll();
    this.bufferNumSlider.values = [0];
    this.isSelectfeature = true;
    this.isSelectDraw = true;
    // this.bufferNumSlider.destroy();
  }

  geometryButtonsClickHandler(evt: any, data: string) {
    // this.clearBufferFilter();
    let g: any = document.getElementsByClassName("spatialButton");
    for (let f = 0; f < g.length; f++) {
      const element = g[f];
      element.classList.remove("spatialButton");
    }
    evt.currentTarget.children[0].classList.toggle("spatialButton");
    if (this.splRelType.length > 0)
      this.sketchViewModel.create(data);
    else
      alert('Please select spatial relationship type');
  }

  updateFilter() {
    this.updateFilterGeometry();
  }

  async updateFilterGeometry() {
    const [geometryEngine, Graphic, FeatureLayer] = await loadModules(["esri/geometry/geometryEngine", "esri/Graphic", "esri/layers/FeatureLayer"]);
    // check decision layer
    for (let index = 0; index < this.selectedItems_Decision.length; index++) {
      const dt = this.decisionLayers.filter((element) => element.item_id == this.selectedItems_Decision[index].item_id);
      let layer_ID = dt[0].item_url.split('/').pop();
      const featUrl = !isNaN(layer_ID) ? dt[0].item_url.trim() : dt[0].item_url.trim() + '/' + this.selectedItems_Decision[index].item_id;
      let layerView = null;
      let _lyr = this.PariveshGIS.ArcMap.findLayerById(this.selectedItems_Decision[index].item_text);
      if (_lyr == undefined) {
        _lyr = new FeatureLayer({
          id: this.selectedItems_Decision[index].item_text,
          url: featUrl,
          apiKey: Bharatmaps,
          visible: true
        });
        this.PariveshGIS.ArcMap.layers.add(_lyr);
      }

      layerView = await this.PariveshGIS.ArcView.whenLayerView(_lyr);
      const featureFilter = {
        geometry: this.sketchGeometry,
        spatialRelationship: this.splRelType[0].item_id,
        distance: this.bufferSize,
        units: "kilometers"
      };
      if (layerView != null) {
        layerView.filter = featureFilter;
        layerView.includedEffect = "drop-shadow(3px, 3px, 3px, black)";
        layerView.effect = "brightness(5) hue-rotate(270deg) contrast(200%)";
      }
    }
    // add a polygon graphic for the bufferSize
    this.PariveshGIS.ArcMap.addMany([this.sketchLayer, this.bufferLayer]);
    if (this.sketchGeometry) {
      if (this.bufferSize > 0) {
        const bufferGeometry = geometryEngine.geodesicBuffer(
          this.sketchGeometry,
          this.bufferSize,
          "kilometers"
        );
        this.filterGeometry = bufferGeometry;
        if (this.bufferLayer.graphics.length === 0) {
          this.bufferLayer.add(
            new Graphic({
              geometry: bufferGeometry,
              symbol: createFillSymbol([255, 182, 193, 0.9], "backward-diagonal", 2, "red")
            })
          );
        }
        else {
          this.bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
        }
      }
      else {
        this.bufferLayer.removeAll();
        this.filterGeometry = this.sketchGeometry;
      }
    }
  }
}
