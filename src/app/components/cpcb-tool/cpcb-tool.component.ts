import { Component, Input } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
import { fetchDataEsriService, getUserKMLFromTree, checkEnableLayer, convertDate } from "./../gisHelper";
import { loadModules } from 'esri-loader';
import { Bharatmaps } from "../gisHelper/localConfigs";
import axios from 'axios';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TableComponent } from '../../commonComponents/table/table.component';
@Component({
  selector: 'app-cpcb-tool',
  templateUrl: './cpcb-tool.component.html',
  styleUrls: ['./cpcb-tool.component.css']
})
export class CpcbToolComponent {
  proposalAllKMLs: any = [];
  @Input() MapData: any = {};
  PariveshGIS: any = {};
  cpcbLayerurl: any = null;
  _sourceLayer: any = {};
  selectedSourceLayer: any = [];
  CPCBSite: any = [];
  siteName: any = [];
  cpcbShow: boolean = false;
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
  cpcbResult: any = [];
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
        else
          this.cpcbLayerurl = layerData.filter((element: any) => element.ggllayerid == 66 || element.ggllayerid == 14);
      }
    });
  }


  async cpcbIcon(idName: any) {
    this.cpcbShow = !this.cpcbShow;
    // this.cpcbReset();
    this.dragable.registerDragElement(idName);
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
  }

  async onItemSelect(data: any) {
    this.siteName = [];
    const [FeatureLayer, Query, geometryEngine] = await loadModules(["esri/layers/FeatureLayer", "esri/rest/support/Query", "esri/geometry/geometryEngine"]);
    this._sourceLayer = checkEnableLayer(data.item_text.replace(' ', ''), this.PariveshGIS.ArcMap.allLayers);

    const _statelyr = new FeatureLayer({
      id: this.cpcbLayerurl[0].ggllayerid,
      url: this.cpcbLayerurl[0].layerurl,
      apiKey: Bharatmaps,
      visible: false
    });

    const _cpcblyr = new FeatureLayer({
      id: this.cpcbLayerurl[1].ggllayerid,
      url: this.cpcbLayerurl[1].layerurl,
      apiKey: Bharatmaps,
      visible: false
    });

    // get state name
    const q = new Query();
    q.returnGeometry = false;
    q.outFields = ["*"];
    q.geometry = this._sourceLayer.graphics.items[0].geometry;
    q.spatialRelationship = "intersects";
    const response = await fetchDataEsriService(q, _statelyr);

    if (response.features.length > 0) {

      const p = new Query();
      p.returnGeometry = true;
      p.outFields = ["siteId,stationNam"];
      p.where = "upper(stateID) = '" + response.features[0].attributes.stname.toUpperCase().replace(" ", "_") + "'";
      p.spatialRelationship = "intersects";
      const response2 = await fetchDataEsriService(p, _cpcblyr);
      let distanceArr = [];
      let ArrayObj = [];
      for (let index = 0; index < response2.features.length; index++) {
        const totalDistance = geometryEngine.distance(response2.features[index].geometry
          , this._sourceLayer.graphics.items[0].geometry);
        distanceArr.push(totalDistance);
        const newObj = {
          Distance: totalDistance,
          geomFeature: response2.features[index].attributes
        }
        let abc = { item_id: newObj.geomFeature.siteId, item_text: newObj.geomFeature.stationNam + "-(" + newObj.Distance.toFixed(4) + "KM)", item_distance: newObj.Distance };
        this.siteName.push(abc);
      }
      let minValue = Math.min(...distanceArr);
      const dfgdgd = this.siteName.filter((element: any) => element.item_distance == minValue);
      this.CPCBSite = dfgdgd;
    }
    else {
      alert("State Not Found...")
    }



    this.PariveshGIS.ArcView.goTo({
      target: this._sourceLayer.graphics.items[0].geometry,
      extent: this._sourceLayer.graphics.items[0].geometry.extent.clone().expand(1.8)
    });
    this.PariveshGIS.ArcView.popup.open({
      features: this._sourceLayer.graphics.items,
      location: this._sourceLayer.graphics.items[0].geometry.type === "polygon" ? this._sourceLayer.graphics.items[0].geometry.centroid : this._sourceLayer.graphics.items[0].geometry.extent.center
    });
  }

  cpcbExecute() {
    let fromdate: any = document.getElementById('fromdate');
    let todate: any = document.getElementById('todate');
    let fdate = convertDate(fromdate.value);
    let tdate = convertDate(todate.value);
    let _URL = "https://airquality.cpcb.gov.in/rawDataApi/raw_1Day_avg";
    const _payLoad = {
      siteId: this.CPCBSite[0].item_id,
      from_date: fdate,
      to_date: tdate
    };
    let headArray = null;

    axios.post(_URL, _payLoad).then((responseData: any) => {
      this.cpcbResult.push(responseData.data.data.Data);
      headArray = Object.keys(responseData.data.data.Data[0]);
      this.bottomSheet.open(TableComponent, {
        data: { tableHeader: headArray, rowData: this.cpcbResult[0], pariveshGIS: this.PariveshGIS },
        hasBackdrop: false,
        closeOnNavigation: false,
        disableClose: true,
      });
    });
  }

  cpcbReset() {
    this.selectedSourceLayer = [];
    this.CPCBSite = [];
    let fromdate: any = document.getElementById('fromdate');
    let todate: any = document.getElementById('todate');
    fromdate.value = null;
    todate.value = null;

  }
}
