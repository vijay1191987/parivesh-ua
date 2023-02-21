import { Component, OnInit } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Bharatmaps, OkmUrl } from "../gisHelper/localConfigs";
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
import { queryOKM, checkKMLGEOJSON, createKMLGraphics, fetchDataEsriService, _TextSymbol, saveInterSectionResults } from "./../gisHelper";

declare const toGeoJSON: any;
let app: any = {};
let _this: any;
let villnamesoi: any;
let mapNo: any;
let stName: any;
let dtName: any;


@Component({
  selector: 'app-caf',
  templateUrl: './caf.component.html',
  styleUrls: ['./caf.component.css']
})
export class CafComponent implements OnInit {
  // for ESRI Map
  ESRIObject: object = {};
  ESRIObj_: object = {};
  qsData: any = {};
  PariveshGIS: any = {};
  outofIndiaFlag: boolean = false;

  childrenData: any = [];
  goeBufferGeom: any = null;
  toposheetBoundryLayer: any;
  subdistrictBoundryLayer: any;
  intersectionResult: any = null;
  _customeGL: any = null;
  counter: number = 0;
  finalIntResult: any = [];
  adminBoundary: any = {};
  loaderFlag: any = false;
  btnProceed: any;


  constructor(private parivesh: PariveshServices) { }

  async ngOnInit() {
    this.btnProceed = window.parent.document.getElementById('btn-proceed');
    this.btnProceed.disabled = true;
    this.loaderFlag = true;
    _this = this;
    this.ESRIObj_ = this.ESRIObject;
    this.PariveshGIS = await this.ESRIObject;
    if (Object.keys(this.qsData).length == 6) {
      this.qsData = this.qsData;
      this._createuserKMLLayer();
    }
    else {
      this.loaderFlag = false;
      alert("Request parameters does not match!");
      this.btnProceed.disabled = true;
    }
  }

  async _createuserKMLLayer() {
    const [MapImageLayer, geometryEngine] = await loadModules(["esri/layers/MapImageLayer", "esri/geometry/geometryEngine"]);
    app.KMLGraphics = [];
    this.adminBoundary = new MapImageLayer({
      url: 'https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Administrative_Boundaries/MapServer/',
      apiKey: Bharatmaps,
      sublayers: [
        {
          id: 3,
          visible: true
        },
        {
          id: 2,
          visible: false
        },
        {
          id: 1,
          visible: true
        },
        {
          id: 0,
          visible: true
        }
      ]
    });
    const _OKMParams = {
      docTypemappingId: this.qsData.documenttypeamapid,
      refId: this.qsData.ref_id,
      refType: this.qsData.ref_type,
      uuid: this.qsData.uuid,
      version: this.qsData.version
    };
    const _okmResponse = await queryOKM(OkmUrl, _OKMParams).catch((error: any) => {
      console.log("Error in OKM#### " + error.code + "::::::::" + error.message);
      return error.response;
    });
    if (_okmResponse.data === null || _okmResponse.status == 404) {
      this.loaderFlag = false;
      alert("Unable to fetch document!! Please try after sometime.");
      this.btnProceed.disabled = true;
    }
    else {
      const _geoJson = toGeoJSON.kml(_okmResponse.data);
      //KML Total Features
      app.KMLData = checkKMLGEOJSON(_geoJson);
      if (app.KMLData.hasPointData || app.KMLData.features.length == 0) {
        this.loaderFlag = false;
        alert("KML is not according to SOP");
        this.btnProceed.disabled = true;
      }
      else {
        // check Out of India Boundery
        const _kmlUnion = geometryEngine.union(app.KMLData.PolygonGeom.length == 0 ? app.KMLData.LineGeom : app.KMLData.PolygonGeom);

        const query_inter: any = {
          returnGeometry: false,
          outFields: ["*"],
          inSR: { wkid: 4326 },
          spatialRelationship: "intersects",
          geometry: _kmlUnion
        };
        let outInd: any = await fetchDataEsriService(query_inter, this.adminBoundary.findSublayerById(0));
        if (outInd.features.length == 0) {
          this.outofIndiaFlag = true;
          query_inter.geometry = null;
          this.goeBufferGeom = geometryEngine.geodesicBuffer(_kmlUnion, 2, "kilometers");
          query_inter.geometry = this.goeBufferGeom;
        }
        const _response = await fetchDataEsriService(query_inter, this.adminBoundary.findSublayerById(0));
        if (_response.features.length > 0) {
          // this.qsData.ref_type
          let f = await createKMLGraphics(app.KMLData, this.qsData, null);
          this._customeGL = f.GL;
          this.parivesh.updateLayer(f.TD);
          this.PariveshGIS.ArcMap.layers.addMany([f.GL, f.TL]);
          this.PariveshGIS.ArcView.goTo({
            target: f.GL.graphics.items,
            extent: f.GL.graphics.items[0].geometry.extent.clone().expand(1.8)
          });
          this.kmlIntersection();
          return;
        }
        else if (_response.features.length == 0) {
          _this.outofIndiaFlag = false;
          alert("Project Location Falling Out of India Boundary.");
          let f = await createKMLGraphics(app.KMLData, this.qsData, null);
          this._customeGL = f.GL;
          this.parivesh.updateLayer(f.TD);
          this.PariveshGIS.ArcMap.layers.addMany([f.GL, f.TL]);
          this.PariveshGIS.ArcView.goTo({
            target: f.GL.graphics.items,
            extent: f.GL.graphics.items[0].geometry.extent.clone().expand(1.8)
          });
          this.btnProceed.disabled = true;
        }
        else {
          _this.outofIndiaFlag = false;
          alert("Project Location Falling Out of India Boundary.");
          this.btnProceed.disabled = true;
        }
      }
    }
  }

  async kmlIntersection() {
    const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);
    this.toposheetBoundryLayer = new FeatureLayer({
      url: 'https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Grid50k_osm/MapServer/1',
      apiKey: Bharatmaps
    });

    const villagePointLayer = new FeatureLayer({
      url: 'https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Village_Point_Grid/MapServer/0',
      apiKey: Bharatmaps
    });
    const query_inter = {
      where: "1=1",
      returnGeometry: false,
      outFields: ["*"],
      geometry: null,
      spatialRelationship: "intersects"// queryObj.SPATIAL_REL_INTERSECTS
    };

    if (this.qsData.documenttypeamapid == 63001) {
      //  village query 63001
      if (app.KMLData.hasOwnProperty("featureExceed")) {
        query_inter.geometry = this.outofIndiaFlag ? this.goeBufferGeom : app.KMLData.PolygonGeom === null ? app.KMLData.LineGeom : app.KMLData.PolygonGeom;
        this.intersectionResult = await fetchDataEsriService(query_inter, this.adminBoundary.findSublayerById(3));
        if (this.intersectionResult.features.length > 0)
          this.saveKmlIntersectionData(this.intersectionResult, this._customeGL.graphics.items[0]);
      }
      else {
        for (let index = 0; index < this._customeGL.graphics.items.length; index++) {
          query_inter.geometry = this.outofIndiaFlag ? this.goeBufferGeom : this._customeGL.graphics.items[index].geometry;
          this.intersectionResult = await fetchDataEsriService(query_inter, this.adminBoundary.findSublayerById(3));
          if (this.intersectionResult.features.length > 0)
            this.saveKmlIntersectionData(this.intersectionResult, this._customeGL.graphics.items[index]);
        }
      }
    }
    else {
      if (app.KMLData.hasOwnProperty("featureExceed")) {
        query_inter.geometry = this.outofIndiaFlag ? this.goeBufferGeom : app.KMLData.PolygonGeom === null ? app.KMLData.LineGeom : app.KMLData.PolygonGeom;
        this.intersectionResult = await fetchDataEsriService(query_inter, this.toposheetBoundryLayer);
        if (this.intersectionResult.features.length > 0)
          this.saveKmlIntersectionData(this.intersectionResult, this._customeGL.graphics.items[0]);
      }
      else {
        for (let index = 0; index < this._customeGL.graphics.items.length; index++) {
          query_inter.geometry = this.outofIndiaFlag ? this.goeBufferGeom : this._customeGL.graphics.items[index].geometry;
          this.intersectionResult = await fetchDataEsriService(query_inter, this.toposheetBoundryLayer);
          if (this.intersectionResult.features.length > 0)
            this.saveKmlIntersectionData(this.intersectionResult, this._customeGL.graphics.items[index]);
        }
      }
    }
    if (this.intersectionResult == null || this.intersectionResult.features.length == 0) {
      const query = {
        returnGeometry: false,
        outFields: ["*"],
        distance: "7",
        units: "esriSRUnit_Kilometer",
        geometry: null,
        spatialRelationship: "intersects"
      };

      if (app.KMLData.hasOwnProperty("featureExceed")) {
        query.geometry = this.outofIndiaFlag ? this.goeBufferGeom : app.KMLData.PolygonGeom === null ? app.KMLData.LineGeom : app.KMLData.PolygonGeom;
        let response = await fetchDataEsriService(query, villagePointLayer);
        if (response.features.length === 0) {
          let subDistResult = await fetchDataEsriService(query, this.adminBoundary.findSublayerById(2));
          let _costalstateName = ['gujarat', 'maharashtra', 'goa', 'karnataka', 'kerala', 'tamil nadu', 'odisha', 'west bengal', 'daman & diu', 'puducherry', 'andaman & nicobar', 'lakshadweep'];
          if (subDistResult.features.length > 0) {
            for (let t = 0; t < subDistResult.features.length; t++) {
              if (this.outofIndiaFlag) {
                if (_costalstateName.includes(subDistResult.features[t].attributes.stname) && response.features.length > 0) {
                  this.saveKmlIntersectionData(response, this._customeGL.graphics.items[0]);
                }
                else {
                  this.loaderFlag = false;
                  alert("Project Location Falling Out of India Boundary.");
                  this.btnProceed.disabled = true;
                  break;
                }
              }
            }
          }
          else {
            this.loaderFlag = false;
            alert("Project Location Falling Out of India Boundary.");
            this.btnProceed.disabled = true;
            return;
          }
          if (subDistResult.features.length > 0)
            this.saveKmlIntersectionData(subDistResult, this._customeGL.graphics.items[0]);
        }
        else
          if (response.features.length > 0)
            this.saveKmlIntersectionData(response, this._customeGL.graphics.items[0]);
      }
      else {
        for (let index = 0; index < this._customeGL.graphics.items.length; index++) {
          query.geometry = this.outofIndiaFlag ? this.goeBufferGeom : this._customeGL.graphics.items[index].geometry;
          let response = await fetchDataEsriService(query, villagePointLayer);
          if (response.features.length === 0) {
            let subdistResult = await fetchDataEsriService(query, this.adminBoundary.findSublayerById(2));
            if (subdistResult.features.length > 0)
              this.saveKmlIntersectionData(subdistResult, this._customeGL.graphics.items[index]);
          }
          else
            if (response.features.length > 0)
              this.saveKmlIntersectionData(response, this._customeGL.graphics.items[index]);
        }
      }
    }
  }

  async saveKmlIntersectionData(_gisData: any, _geometry: any) {
    this.counter++;
    let geoDataArr = [];
    if (_gisData.features.length > 0) {
      for (let i = 0; i < _gisData.features.length; i++) {
        let geoData: any = {};
        geoData.patchId = _geometry.attributes.patch_id;
        geoData.area = _geometry.attributes.Area != undefined ? _geometry.attributes.Area : '';
        geoData.length = _geometry.attributes.Length;
        geoData.latNorthFm = _geometry.attributes.Ymin;
        geoData.latNorthTo = _geometry.attributes.Xmin;
        geoData.lonEastFm = _geometry.attributes.Ymax;
        geoData.lonEastTo = _geometry.attributes.Xmax;

        if (this.qsData.documenttypeamapid == 63001) {
          villnamesoi = _gisData.features[i].attributes.vilnam_soi;
          stName = _gisData.features[i].attributes.stname;
          dtName = _gisData.features[i].attributes.dtname;
          mapNo = 0;
        }
        else {
          villnamesoi = _gisData.features[i].attributes.vilnam_soi;
          stName = _gisData.features[i].attributes.stname;
          dtName = _gisData.features[i].attributes.dtname;
          mapNo = _gisData.features[i].attributes.osm_50 == undefined ? 0 : _gisData.features[i].attributes.osm_50;
        }

        const _villageName = _gisData.features[i].attributes.hasOwnProperty("vilname") ? _gisData.features[i].attributes.vilname : (_gisData.features[i].attributes.vilname11 == undefined) ? "0" : _gisData.features[i].attributes.vilname11;
        geoData.refId = this.qsData.ref_id;
        geoData.proponentId = "1";
        geoData.uuid = this.qsData.uuid;
        geoData.docTypeMappingId = this.qsData.documenttypeamapid;
        geoData.uploadedName = this.qsData.uploaded_name;
        geoData.refType = this.qsData.ref_type;
        geoData.vilcode11 = (_gisData.features[i].attributes.hasOwnProperty('vilcode11') || _gisData.features[i].attributes.hasOwnProperty('vil_lgd')) ? (_gisData.features[i].attributes.vil_lgd == undefined) ? _gisData.features[i].attributes.vilcode11.toString() : _gisData.features[i].attributes.vil_lgd.toString() : '';
        geoData.vilnamSoi = villnamesoi == null ? _villageName : (villnamesoi == undefined) ? "NA" : villnamesoi;
        geoData.mapNo = mapNo.toString();
        geoData.stCode11 = _gisData.features[i].attributes.state_lgd === undefined ? _gisData.features[i].attributes.st_lgd.toString() : _gisData.features[i].attributes.state_lgd.toString();
        geoData.stName = stName;
        geoData.dtCode11 = _gisData.features[i].attributes.dt_lgd === undefined ? _gisData.features[i].attributes.dist_lgd.toString() : _gisData.features[i].attributes.dt_lgd.toString();
        geoData.dtName = dtName;
        geoData.sdtCode11 = _gisData.features[i].attributes.subdt_lgd === undefined ? _gisData.features[i].attributes.sdt_lgd.toString() : _gisData.features[i].attributes.subdt_lgd.toString();
        geoData.sdtName = _gisData.features[i].attributes.sdtname;
        geoData.vilName11 = villnamesoi == null ? _villageName : (villnamesoi == undefined) ? "NA" : villnamesoi;
        geoData.version = this.qsData.version;
        geoDataArr.push(geoData);
      }
    }
    if (geoDataArr.length > 0)
      this.finalIntResult = [...this.finalIntResult, ...geoDataArr];
    if (this.counter == this._customeGL.graphics.items.length) {
      const res = await saveInterSectionResults(this.finalIntResult);
      console.log("data successfully inserted....", res);
      this.loaderFlag = false;
      this.btnProceed.disabled = false;
    }
  }
}
