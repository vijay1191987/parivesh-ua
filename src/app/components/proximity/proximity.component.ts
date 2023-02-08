import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DragableService } from 'src/app/services/dragable.service';
import { TableComponent } from '../../commonComponents/table/table.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CreateEsrisymbol } from "./../gisHelper";
import { loadModules } from 'esri-loader';
import { Bharatmaps } from "../gisHelper/localConfigs";
import Query from "@arcgis/core/rest/support/Query";
let _this: any;
let app: any = {};
app.userKMLLayers = [];
let Enviorenmentlayer: any;
let Forest_0: any;
let Protectarealayer_0: any;
let school: any;
let Environmentclearance: any;
let forestclearanceformab: any;
let forestclearanceformc: any;

@Component({
  selector: 'app-proximity',
  templateUrl: './proximity.component.html',
  styleUrls: ['./proximity.component.css']
})

export class ProximityComponent implements OnInit {
  @Input() MapData: any = {};
  @Input() dssLayerTool: any;

  proposalAllKMLs: any = [];
  refresh: boolean = false;
  selectedSourceLayer: any = [];
  selectedItems_DecisionLayers: any = [];
  headArray = [
    { 'Head': 'Source', 'FieldName': 'Source' },
    { 'Head': 'Name', 'FieldName': 'Name' },
    { 'Head': 'Distance', 'FieldName': 'Distance' },
    { 'Head': 'Action', 'FieldName': 'ViewButton' }
  ];
  dropdownSettings_1: IDropdownSettings = {
    singleSelection: true,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true,
    //allowRemoteDataSearch: true
  };

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

  decisionLayers: any = [
    { item_id: "Enviorenmentlayer", item_text: 'ESZ Layer' },
    { item_id: "Forest", item_text: 'Forest Layer' },
    { item_id: "pawll", item_text: 'PA WLL' },
    { item_id: "school", item_text: 'School' },
    { item_id: "parivesh1ec", item_text: 'Environment Clearance' },
    { item_id: "parivesh1fcab", item_text: 'Forest Clearances - Diversion & Renewal of Lease on Forest Land' },
    { item_id: "parivesh1fcc", item_text: 'Forest Clearances - For seeking prior approval for exploration and Survey' }
  ]

  PariveshGIS: any = {};
  usersList: any[] = [];
  proximityShow: boolean = false;
  proxiData: any = {};
  proxiTargetlayer: any[] = [];
  ProxidisplayResultInt: any[] = [];
  constructor(private dragable: DragableService, private bottomSheet: MatBottomSheet) { }

  async ngOnInit() {
    _this = this;
    const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_")) {
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    }
    else {
      this.PariveshGIS = await t.ESRIObj_;
    }

    Enviorenmentlayer = new FeatureLayer({
      url: "https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/ESZ/MapServer/0",
      apiKey: Bharatmaps,
      id: "Enviorenmentlayer",
      title: "ESZ",
      visible: false
    });

    Forest_0 = new FeatureLayer({
      url: "https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Forest/MapServer/0",
      apiKey: Bharatmaps,
      title: "Forest",
      id: "Forest",
      visible: false
    });


    Protectarealayer_0 = new FeatureLayer({
      url: "https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Protected_Area/MapServer/0",
      apiKey: Bharatmaps,
      id: "pawll",
      title: "Protected Area",
      visible: false
    });

    school = new FeatureLayer({
      url: "https://gisservrsdiv.nic.in/bharatmaps/rest/services/PanIndia/india_adminpoint/MapServer/4",
      apiKey: Bharatmaps,
      title: "School",
      id: "school",
      visible: false
    });

    Environmentclearance = new FeatureLayer({
      url: "https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/parivesh1/MapServer/0",
      apiKey: Bharatmaps,
      id: "parivesh1ec",
      title: "EnvironmentClearance",
      visible: false
    });

    forestclearanceformab = new FeatureLayer({
      url: "https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/parivesh1/MapServer/1",
      apiKey: Bharatmaps,
      id: "parivesh1fcab",
      title: "ForestClearanceAB",
      visible: false
    });

    forestclearanceformc = new FeatureLayer({
      url: "https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/parivesh1/MapServer/2",
      apiKey: Bharatmaps,
      id: "parivesh1fcc",
      title: "ForestClearanceC",
      visible: false
    });

    this.PariveshGIS.ArcMap.addMany([Enviorenmentlayer, Forest_0, Protectarealayer_0, school, Environmentclearance, forestclearanceformab, forestclearanceformc]);
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

  async calculateProximityResult(proximityLayer: any) {
    const dLayer = this.PariveshGIS.ArcMap.findLayerById(proximityLayer);
    const _sourceLayer = this.PariveshGIS.ArcMap.layers.items.filter(function (_d: any) {
      if (_d.title === _this.selectedSourceLayer[0].item_text)
        return _d;
    });
    const [geometryEngine] = await loadModules(["esri/geometry/geometryEngine"]);
    const queryParams = dLayer.createQuery();
    queryParams.geometry = _sourceLayer[0].graphics._items[0].geometry;
    queryParams.distance = 10;
    queryParams.outSpatialReference = { wkid: 4326 };
    queryParams.units = "esriSRUnit_Kilometer";
    queryParams.returnGeometry = true;
    queryParams.outFields = ["*"];
    queryParams.f = "pjson";
    dLayer.queryFeatures(queryParams).then(function (results: any) {
      if (results.features.length > 0) {
        let _distanceArray: any = [];
        let _tempArray: any = [];
        results.features.forEach(function (a: any, b: any) {
          const totalDistance = geometryEngine.distance(_sourceLayer[0].graphics._items[0].geometry, a.geometry);
          if (dLayer.title == "Forest") {
            _distanceArray.push({ Source: dLayer.title, Feature: a.attributes.division, Distance: (totalDistance), Geom: a.geometry });
            _tempArray.push(totalDistance);
          }
          else if (dLayer.title == "School") {
            _distanceArray.push({ Source: dLayer.title, Feature: a.attributes.schname, Distance: (totalDistance), Geom: a.geometry });
            _tempArray.push(totalDistance);
          }
          else if (dLayer.title == "EnvironmentClearance") {
            _distanceArray.push({ Source: dLayer.title, Feature: a.attributes.proposal_n, Distance: (totalDistance), Geom: a.geometry });
            _tempArray.push(totalDistance);
          }
          else if (dLayer.title == "ForestClearanceAB") {
            _distanceArray.push({ Source: dLayer.title, Feature: a.attributes.proposal_n, Distance: (totalDistance), Geom: a.geometry });
            _tempArray.push(totalDistance);
          }
          else if (dLayer.title == "ForestClearanceC") {
            _distanceArray.push({ Source: dLayer.title, Feature: a.attributes.proposal_n, Distance: (totalDistance), Geom: a.geometry });
            _tempArray.push(totalDistance);
          }
          else {
            _distanceArray.push({ Source: dLayer.title, Feature: a.attributes.Name, Distance: (totalDistance), Geom: a.geometry });
            _tempArray.push(totalDistance);
          }
        });
        let minValue = Math.min(..._tempArray);
        let maxValue = Math.max(..._tempArray);
        let index = _tempArray.indexOf(minValue);
        if (index != -1) {
          if (typeof (_distanceArray[index].Distance) === "number") {
            _distanceArray[index].Distance = (_distanceArray[index].Distance / 1000).toFixed(4) + " KM";
          }
          _this.ProxidisplayResultInt.push({
            Source: dLayer.title,
            Name: _distanceArray[index].Feature,
            Distance: minValue === 0 ? "Area of Interest falls within " + _distanceArray[index].Feature + " Division." : _distanceArray[index].Distance,
            Geom: _distanceArray[index].Geom
          });
        }
      }
      else {
        _this.ProxidisplayResultInt.push(
          {
            Source: dLayer.title,
            Name: "NA",
            Distance: "No nearby feature found within 10 KM from area of interest"
          }
        );
      }
    });
  }

  onItemSelect(data: any) {
    const _gl = this.PariveshGIS.ArcMap.layers.items.filter(function (_d: any) {
      if (_d.title === data.item_text)
        return _d;
    });
    this.PariveshGIS.ArcView.goTo({ target: _gl[0].graphics.items[0].geometry.extent.expand(1.6) });
  }
  onItemDeSelect(data: any) {
    this.ProxidisplayResultInt = [];
    this.selectedItems_DecisionLayers.forEach((element: any) => {
      this.calculateProximityResult(element.item_id);
    });
  }

  onSelectAll(items: any) {
    this.ProxidisplayResultInt = [];
    items.forEach((element: any) => {
      this.calculateProximityResult(element.item_id);
    });
  }

  onTargetlayerSelect(items: any) {
    this.ProxidisplayResultInt = [];
    if (this.selectedItems_DecisionLayers.length > 1) {
      this.selectedItems_DecisionLayers.forEach((element: any) => {
        this.calculateProximityResult(element.item_id);
      });
    }
    else {
      this.calculateProximityResult(items.item_id);
    }
  }


  proximityIcon(idName: any) {
    this.proximityShow = !this.proximityShow;
    this.dragable.registerDragElement(idName);
  }



  //  bottom sheet
  openBottomSheet() {
    if (this.selectedSourceLayer.length == 0 || this.selectedItems_DecisionLayers.length == 0) {
      alert("Please select KML.");
    }
    else {
      this.bottomSheet.open(TableComponent, {
        data: { tableHeader: this.headArray, rowData: this.ProxidisplayResultInt, pariveshGIS: this.PariveshGIS },
        hasBackdrop: true,
        closeOnNavigation: false,
        disableClose: true,
      });
    }
  }

  clearProximityfiltr() {
    this.selectedSourceLayer = [];
    this.selectedItems_DecisionLayers = [];
  }
}
