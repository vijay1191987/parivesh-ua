import { Component, Input } from '@angular/core';
import { LayerNode } from './../layers/layers.component'
import { OkmUrl } from "../gisHelper/localConfigs";
import { queryOKM, checkKMLGEOJSON, createKMLGraphics, _TextSymbol, getProposalDetails, groupByJsonData } from "./../gisHelper";
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';

declare const toGeoJSON: any;
const app: any = {};

@Component({
  selector: 'app-dss-tools',
  templateUrl: './dss-tools.component.html',
  styleUrls: ['./dss-tools.component.css']
})
export class DssToolsComponent {
  //{To Access ESRI MapView object}
  ESRIObject: object = {};
  ESRIObj_: object = {};
  PariveshGIS: any = {};
  qsData: any = {};
  dssToolLayers: any;


  constructor(private parivesh: PariveshServices) { }

  public _createTreeChildren(_data: any) {
    return _data.map((e: any, i: any) => {
      let v = {};
      v = { LayerName: e.uploadedname, selected: true, reqType: "DSS", LayerID: i, LegendPath: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAS0lEQVQ4jWMpyi/czsTE6MBABfDv3/8DLExMjA4dXj4c1DCwYtsWBxZqGIQMRg0cNXDUwFEDRw2EGvjv3/8DFdu2OFDDsH///h8AAJBpE3+6+WDuAAAAAElFTkSuQmCC" };
      return v;
    });
  }

  async ngOnInit() {
    this.ESRIObj_ = this.ESRIObject;
    this.PariveshGIS = await this.ESRIObject;

    const pData = await getProposalDetails(this.qsData);
    let layerMasters = groupByJsonData(pData.data, "docname");
    this.dssToolLayers = layerMasters;
    let treeData: any = [];
    Object.keys(layerMasters).forEach((element: any) => {
      const data = {
        LayerName: element.replace('_', ' '),
        reqType: "DSS",
        selected: true,
        children: this._createTreeChildren(layerMasters[element])
      };
      treeData.push(data);
    });
    const tdata = {
      LayerName: this.qsData.proposalno, selected: true, LayerID: 655, children: treeData
    };

    for (let i = 0; i < pData.data.length; i++) {
      let element = pData.data[i];
      const proposalsData = {
        docTypemappingId: element.mapppingid,
        refId: element.refid,
        refType: element.ref_type,
        uuid: element.uuid,
        version: element.version2 == 1 ? "1.0" : element.version2
      }
      const _okmResponse = await queryOKM(OkmUrl, proposalsData).catch((error: any) => {
        console.log("Error in OKM#### " + error.code + "::::::::" + error.message);
        return error.response;
      });
      const _geoJson = toGeoJSON.kml(_okmResponse.data);
      app.KMLData = checkKMLGEOJSON(_geoJson);
      let f = await createKMLGraphics(app.KMLData, pData.data[i], i);
      this.PariveshGIS.ArcMap.layers.addMany([f.GL, f.TL]);
      if (pData.data[i].docname.toUpperCase() == "MAIN_KML") {
        this.PariveshGIS.ArcView.goTo({ target: f.GL.graphics.items, zoom: 16 });
      }
    }
    const TREE_DATA: LayerNode[] = [tdata];
    this.parivesh.updateLayer(TREE_DATA);
  }
}
