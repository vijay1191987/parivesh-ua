import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { loadModules } from 'esri-loader';
import { fetchDataEsriService, createFillSymbol } from "./../gisHelper";
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';

@Component({
  selector: 'app-buffer',
  templateUrl: './buffer.component.html',
  styleUrls: ['./buffer.component.css']
})

export class BufferComponent implements OnInit {
  dropdownList: any = [];
  selectedItems: any = [];

  bufferShow: boolean = false;
  //{To Access ESRI MapView object}
  @Input() MapData: any = {};
  @Input() dssLayerTool: any;
  proposalAllKMLs: any = [];
  refresh: boolean = false;
  PariveshGIS: any = {};
  selectBufferType: any = [];
  selectedSourceLayer: any = [];
  selectedItems_Decision: any = [];
  selectedTargetLayers: any = [];
  isSelectfeature: boolean = true;
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

  decisionLayers = [
    { item_id: "Enviorenmentlayer", item_text: 'ESZ Layer' },
    { item_id: "Forest", item_text: 'Forest Layer' },
    { item_id: "pawll", item_text: 'PA WLL' },
    { item_id: "school", item_text: 'School' },
    { item_id: "parivesh1ec", item_text: 'Environment Clearance' },
    { item_id: "parivesh1fcab", item_text: 'Forest Clearances - Diversion & Renewal of Lease on Forest Land' },
    { item_id: "parivesh1fcc", item_text: 'Forest Clearances - For seeking prior approval for exploration and Survey' }
  ];

  bufferType = [{ item_id: 1, item_text: "Select by Feature" }, { item_id: 2, item_text: "Draw by Feature" }];
  bufferUnits = [{ unit: "kilometers", val: "KILOMETER" }];

  bufferDistance: any = [];
  selectedBufferUnit: any = [];

  constructor(private dragable: DragableService, private parivesh: PariveshServices) {
    this.parivesh.currentLayerTreeData.subscribe(layerData => {
      if (layerData.length > 0) {
        if (layerData[0].hasOwnProperty('selected')) {

        }
        else {
          const decisionLayers = layerData.filter((element: any) => element.decision_layer == true);
          console.log(decisionLayers);
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

    console.log(this.PariveshGIS);

  }
  async ngOnInit() {

  }




  ngOnChanges(changes: SimpleChanges) {
    if (this.dssLayerTool.dssToolLayers != undefined) {
      if (Object.keys(this.dssLayerTool.dssToolLayers).length != 0 || typeof this.dssLayerTool.dssToolLayers != undefined) {
        for (let index = 0; index < this.dssLayerTool.dssToolLayers.FC_KML.length; index++) {
          const f = { item_id: index, item_text: this.dssLayerTool.dssToolLayers.FC_KML[index].uploadedname };
          this.proposalAllKMLs.push(f);
          this.refresh = true;
        }
      }
    }
  }
  _sourceLayer: any = {};
  onItemSelect(data: any) {
    const _gl = this.PariveshGIS.ArcMap.layers.items.filter(function (_d: any) {
      if (_d.title === data.item_text)
        return _d;
    });

    this._sourceLayer = _gl[0];

    this.PariveshGIS.ArcView.goTo({ target: _gl[0].graphics.items[0].geometry.extent.expand(1.6) });
  }


  onSelectDecisionLayer(data: any) {
    const index = this.selectedTargetLayers.indexOf(data.item_id);
    if (index > -1) {
      this.selectedTargetLayers.splice(index, 1);
    }
    this.selectedTargetLayers.push(data.item_id);

  }
  onSelectAll(items: any) {
    this.selectedTargetLayers = [];
    if (items.length === 0)
      this.selectedTargetLayers = [];
    items.forEach((element: any) => {
      this.selectedTargetLayers.push(element.item_id);
    });

  }

  onItemDeSelect(data: any) {
    const index = this.selectedTargetLayers.indexOf(data.item_id);
    if (index > -1) {
      this.selectedTargetLayers.splice(index, 1);
    }
  }
  eventbufferfeature(data: any) {
    if (data.item_id == 1)
      this.isSelectfeature = true;
    else {
      this.isSelectfeature = false;
      // this.isForm = false;
    }
  }



  i: any = 2;
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
  nameModel: string = "";
  listOfNames = [];


  async executeBuffer() {
    const [geometryEngine, Graphic] = await loadModules(["esri/geometry/geometryEngine", "esri/Graphic"]);
    if (this.selectedTargetLayers.length == null || this.selectedTargetLayers.length == undefined) {
      alert("Please select KML.")
    }
    else {
      var input = document.getElementsByName('bufferVal');
      for (let i = 0; i < input.length; i++) {
        const element = (<HTMLInputElement>document.getElementById('colorPra_' + Number(i + 1)));
        const buffer_geom = geometryEngine.geodesicBuffer(this._sourceLayer.graphics._items[0].geometry, Number((<HTMLInputElement>input[i]).value), this.selectedBufferUnit, true);
        let polylineGraphic = new Graphic({
          geometry: buffer_geom,
          symbol: createFillSymbol([255, 182, 193, 0.9], "backward-diagonal", 2, element.style.backgroundColor)
        });
        this.PariveshGIS.ArcView.graphics.add(polylineGraphic);
      }


    }
  }
}
