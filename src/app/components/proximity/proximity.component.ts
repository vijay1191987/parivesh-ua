import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DragableService } from 'src/app/services/dragable.service';
import { TableComponent } from '../../commonComponents/table/table.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { checkEnableLayer, getUserKMLFromTree } from "./../gisHelper";
import { loadModules } from 'esri-loader';
import { Bharatmaps } from "../gisHelper/localConfigs";
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
let that: any;
let app: any = {};
app.userKMLLayers = [];

@Component({
  selector: 'app-proximity',
  templateUrl: 'proximity.component.html',
  styleUrls: ['proximity.component.css']
})

export class ProximityComponent implements OnInit {
  @Input() MapData: any = {};
  @Input() dssLayerTool: any;
  PariveshGIS: any = {};

  proposalAllKMLs: any = [];
  selectedSourceLayer: any = [];
  selectedItems_DecisionLayers: any = [];
  decisionLayers: any = [];
  usersList: any[] = [];
  proximityShow: boolean = false;
  proxiData: any = {};
  proxiTargetlayer: any[] = [];
  ProxidisplayResultInt: any[] = [];

  headArray = ['Source','Name','Distance','Action'];
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

  async ngOnInit() {
    that = this;
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
  }

  async calculateProximityResult(dLayerID: any) {
    const dt = this.decisionLayers.filter((element: any) => element.item_id === dLayerID);
    let layer_ID = dt[0].item_url.split('/').pop();
    const featUrl = !isNaN(layer_ID) ? dt[0].item_url.trim() : dt[0].item_url.trim() + '/' + dLayerID;
    const [geometryEngine, FeatureLayer] = await loadModules(["esri/geometry/geometryEngine", "esri/layers/FeatureLayer"]);
    const dLayer = new FeatureLayer({
      url: featUrl,
      apiKey: Bharatmaps,
      visible: false
    });

    const _sourceLayer = checkEnableLayer(that.selectedSourceLayer[0].item_text.replace(' ', ''), this.PariveshGIS.ArcMap.allLayers);
    const queryParams = dLayer.createQuery();
    queryParams.geometry = _sourceLayer.graphics._items[0].geometry;
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
          const totalDistance = geometryEngine.distance(_sourceLayer.graphics._items[0].geometry, a.geometry);
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
          that.ProxidisplayResultInt.push({
            Source: dLayer.title,
            Name: _distanceArray[index].Feature === undefined ? "NA" : _distanceArray[index].Feature,
            Distance: minValue === 0 ? "Area of Interest falls within " + _distanceArray[index].Feature + " Division." : _distanceArray[index].Distance,
            geometry: _distanceArray[index].Geom,
            tabEnable: false
          });
        }
      }
      else {
        that.ProxidisplayResultInt.push(
          {
            Source: dLayer.title,
            Name: "NA",
            Distance: "No nearby feature found within 10 KM from area of interest",
            tabEnable: false
          }
        );
      }
    });
  }
  onItemSelect(data: any) {
    const _gl = checkEnableLayer(data.item_text.replace(' ', ''), this.PariveshGIS.ArcMap.allLayers);
    this.PariveshGIS.ArcView.goTo({
      target: _gl.graphics.items[0].geometry,
      extent: _gl.graphics.items[0].geometry.extent.clone().expand(1.8)
    });
    this.PariveshGIS.ArcView.popup.open({
      features: _gl.graphics.items,
      location: _gl.graphics.items[0].geometry.type === "polygon" ? _gl.graphics.items[0].geometry.centroid : _gl.graphics.items[0].geometry.extent.center
    });
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
  //bottom sheet
  openBottomSheet() {
    if (this.selectedSourceLayer.length == 0 || this.selectedItems_DecisionLayers.length == 0) {
      alert("Please select KML.");
    }
    else {
      this.bottomSheet.open(TableComponent, {
        data: { tableHeader: this.headArray, rowData: this.ProxidisplayResultInt, pariveshGIS: this.PariveshGIS },
        hasBackdrop: false,
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
