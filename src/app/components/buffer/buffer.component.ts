import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { loadModules } from 'esri-loader';
import { fetchDataEsriService, createFillSymbol, getUserKMLFromTree } from "./../gisHelper";
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
import { Bharatmaps } from "../gisHelper/localConfigs";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TableComponent } from 'src/app/commonComponents/table/table.component';

@Component({
  selector: 'app-buffer',
  templateUrl: 'buffer.component.html',
  styleUrls: ['buffer.component.css']
})

export class BufferComponent implements OnInit {
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
  decisionLayers: any[] = [];
  bufferType = [{ item_id: 1, item_text: "Select by Feature" }, { item_id: 2, item_text: "Draw by Feature" }];
  bufferUnits = [{ unit: "kilometers", val: "KILOMETER" }];
  _sourceLayer: any = {};
  selectedBufferUnit: any = [];

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
    this.bufferShow = !this.bufferShow;
    this.dragable.registerDragElement(idName);
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
  }
  ngOnInit(): void {

  }

  onItemSelect(data: any) {
    const _gl = this.PariveshGIS.ArcMap.layers.items.filter(function (_d: any) {
      if (_d.title === data.item_text)
        return _d;
    });
    this._sourceLayer = _gl[0];
    this.PariveshGIS.ArcView.goTo({
      target: _gl[0].graphics.items[0].geometry,
      zoom: 8
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

  eventbufferfeature(data: any) {
    if (data.item_id == 1)
      this.isSelectfeature = true;
    else {
      this.isSelectfeature = false;
      // this.isForm = false;
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
    this.selectBufferType = null;
    this.selectedSourceLayer = null;
    this.selectedItems_Decision = null;
    this.selectedBufferUnit = null;
    var input: any = document.getElementsByName('bufferVal');
    for (let i = 0; i < input.length; i++) {
      input[i].value = null;
    }
  }

  async executeBuffer() {
    const _bufferResults = [];
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
          let matched: any = _bufferResults.filter(elem => elem.TargetLayer == this.selectedItems_Decision[index].item_text);
          if (matched.length > 0) {
            matched[0].Results.push({ BufferDistance: _bufferDistance[i], Feat: response.features });
            esriRes = matched[0].Results;
          }
          else
            esriRes.push({ BufferDistance: _bufferDistance[i], Feat: response.features });
          const _json = { TargetLayer: this.selectedItems_Decision[index].item_text, BufferValue: _bufferDistance, Results: esriRes, tabEnable: true };
          if (_bufferResults.length > 0) {
            if (matched.length > 0) {
              let _ix = _bufferResults.findIndex(obj => obj.TargetLayer == _json.TargetLayer);
              _bufferResults.splice(_ix, 1);
            }
          }
          _bufferResults.push(_json);
        }
      }
      this.bottomSheet.open(TableComponent, {
        data: { rowData: _bufferResults, pariveshGIS: this.PariveshGIS },
        hasBackdrop: false,
        closeOnNavigation: false,
        disableClose: true,
      });
    }
  }
}
