import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LayerNode } from './../layers/layers.component'
import { loadModules } from 'esri-loader';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import { newtokenbharatmaps__, OkmUrl } from "../gisHelper/localConfigs";
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
import { checkKMLGEOJSON, CreateEsrisymbol, fetchDataEsriService, _TextSymbol, saveInterSectionResults, createCanvasImage } from "./../gisHelper";

declare const toGeoJSON: any;
declare function geojsonToArcGIS(obj1: any, obj2: any): any;
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
  PariveshGIS: any = {};

  outofIndiaFlag: boolean = false;
  qsData: any = {};
  childrenData: any = [];
  goeBufferGeom: any = null;
  villageBoundryLayer: any;
  toposheetBoundryLayer: any;
  subdistrictBoundryLayer: any;
  intersectionResult: any = null;
  _customeGL: any = null;
  counter: number = 0;
  finalIntResult: any = [];

  constructor(private route: ActivatedRoute, private http: HttpClient, private parivesh: PariveshServices) {
    _this = this;
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length) {
        this.qsData = params;
        //this._createuserKMLLayer();
      }
    });
  }

  async ngOnInit() {
    this.ESRIObj_ = this.ESRIObject;
    this.PariveshGIS = await this.ESRIObject;
    this._createuserKMLLayer();
  }

  async _createuserKMLLayer() {
    const _promiseObj = [];
    const [FeatureLayer, geometryEngine] = await loadModules(["esri/layers/FeatureLayer", "esri/geometry/geometryEngine"]);
    let params = new HttpParams();
    params = params.set('docTypemappingId', this.qsData.documenttypeamapid);
    params = params.set('refId', this.qsData.ref_id);
    params = params.set('refType', this.qsData.ref_type);
    params = params.set('uuid', this.qsData.uuid);
    params = params.set('version', this.qsData.version);

    const _p = new Promise((resolve, reject) => {
      this.http.get(OkmUrl, { params, responseType: 'text' }).subscribe(async (okmRes) => {
        let userXML = okmRes.split(" ");
        let finalXML = '';
        let modifiedXML = null;
        for (var t = 0; t < userXML.length; t++) {
          if (userXML[t].includes("xsi:schemaLocation")) {
            modifiedXML = userXML[t].replace("xsi:schemaLocation", "xmlns:schemaLocation");
          } else {
            modifiedXML = userXML[t];
          }
          finalXML += modifiedXML + " ";
        }
        app.KMLGraphics = [];
        const finalKML = new window.DOMParser().parseFromString(finalXML, "text/xml");
        // app.KMLData
        const _geoJson = toGeoJSON.kml(finalKML);
        //KML Total Features
        app.KMLData = checkKMLGEOJSON(_geoJson);
        // check Out of India Boundery
        const state_Boundaries_0 = new FeatureLayer({
          url: 'https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Administrative_Boundaries/MapServer/0',
          apiKey: newtokenbharatmaps__
        });

        const _kmlUnion = geometryEngine.union(app.KMLData.PolygonGeom.length == 0 ? app.KMLData.LineGeom : app.KMLData.PolygonGeom);

        const query_inter: any = {
          returnGeometry: false,
          outFields: ["*"],
          inSR: { wkid: 4326 },
          spatialRelationship: "intersects",
          geometry: _kmlUnion
        };
        let outInd: any = await fetchDataEsriService(query_inter, state_Boundaries_0);
        if (outInd.features.length == 0) {
          this.outofIndiaFlag = true;
          this.goeBufferGeom = geometryEngine.geodesicBuffer(_kmlUnion, 2, "kilometers");
          query_inter.geometry = this.goeBufferGeom;
        }
        resolve(fetchDataEsriService(query_inter, state_Boundaries_0));
      },
        (error: any) => {
          reject({ Message: error });
        });
    });
    _promiseObj.push(_p);
    const resultFromOKM = promiseUtils.eachAlways(_promiseObj);
    resultFromOKM.then(function (eachAlwaysResults: any) {
      if (!eachAlwaysResults[0].hasOwnProperty("error")) {
        eachAlwaysResults.forEach((_response: any, _index: any) => {
          if (_response.value.features.length > 0)
            _this.createKMLGraphics();
          else if (_response.value.features.length == 0) {
            _this.outofIndiaFlag = true;
            alert("Project Location Falling Out of India Boundary.");
            _this.createKMLGraphics();
            return;
          }
          else {
            _this.outofIndiaFlag = true;
            alert("Project Location Falling Out of India Boundary.");
            return;
          }
        });
      }
      else {
        console.log(eachAlwaysResults[0].error.Message);
      }
    }).catch(function (errors: any) {
      console.log(errors);
    });
  }

  async createKMLGraphics() {
    const [GraphicsLayer, Graphic, geometryEngine, Polyline, Polygon] = await loadModules(['esri/layers/GraphicsLayer', 'esri/Graphic', 'esri/geometry/geometryEngine', "esri/geometry/Polyline", "esri/geometry/Polygon"]);

    this._customeGL = new GraphicsLayer();
    this._customeGL.id = "EsriUserMap";
    const _textGL = new GraphicsLayer();
    this.childrenData = [];

    if (app.KMLData.hasPointData || app.KMLData.features.length == 0) {
      alert("KML is not according to SOP");
      return false;
    }
    else {
      this.childrenData = [];
      let treeData: any[] = [];
      let _kmlFeature = [];
      if (app.KMLData.features.length >= 50) {
        this.childrenData = [];
        const bc: any = {
          type: "FeatureCollection", features: [], featureExceed: true, LineGeom: app.KMLData.LineGeom.length > 0 ? geometryEngine.union(app.KMLData.LineGeom) : null, PolygonGeom: app.KMLData.PolygonGeom.length > 0 ? geometryEngine.union(app.KMLData.PolygonGeom) : null
        };
        if (app.KMLData.LineGeom.length > 0) {
          _kmlFeature.push({
            "type": "Feature", "id": 1, geometry: { coordinates: [bc.LineGeom.paths], type: "LineString" }, properties: app.KMLData.features[0].properties
          });
        }
        if (app.KMLData.PolygonGeom.length > 0) {
          _kmlFeature.push({
            "type": "Feature", "id": 2, geometry: { coordinates: [bc.PolygonGeom.rings], type: "Polygon" }, properties: app.KMLData.features[0].properties
          });
        }
        if (bc.LineGeom === null)
          delete bc.LineGeom;
        if (bc.PolygonGeom === null)
          delete bc.PolygonGeom;

        bc.features = _kmlFeature;
        app.KMLData = bc;
        let _userGraphic = null;
        const data: any = { LayerName: "User KML", LayerID: 999, children: [] };
        if (bc.LineGeom != null) {
          let tp: LayerNode = {} as LayerNode;
          tp.LayerName = "Line Feature";
          tp.LayerID = 11;
          tp.LegendPath = createCanvasImage("Line", "red");
          tp.reqType = "User";
          this.childrenData.push(tp);

          let _length = geometryEngine.geodesicLength(bc.LineGeom, "kilometers");
          if (_length < 0)
            _length = _length * -1;
          else
            _length = _length

          let _attr = {
            patch_id: 1, Length: _length.toFixed(4),
            Ymin: bc.LineGeom.extent.ymin, Xmin: bc.LineGeom.extent.xmin,
            Ymax: bc.LineGeom.extent.ymax, Xmax: bc.LineGeom.extent.xmax
          }

          _userGraphic = new Graphic({
            id: 11,
            geometry: bc.LineGeom,
            symbol: CreateEsrisymbol("[226, 119, 40]", "red", "Line", "solid"),
            attributes: _attr
          });
          if (this.qsData.ref_type.toUpperCase() == "FC") {
            _TextSymbol.text = 1;
            const _textGraphic = new Graphic();
            _textGraphic.geometry = bc.LineGeom.extent.center;
            _textGraphic.symbol = _TextSymbol;
            _textGL.add(_textGraphic);
          }
          this._customeGL.add(_userGraphic);
        }
        if (bc.PolygonGeom != null) {
          let tp: LayerNode = {} as LayerNode;
          tp.LayerName = "Polygon Feature";
          tp.LayerID = 22;
          tp.LegendPath = createCanvasImage("Rect", "red");
          tp.reqType = "User";
          this.childrenData.push(tp);

          let _area = geometryEngine.geodesicArea(bc.PolygonGeom, "square-meters");
          if (_area < 0)
            _area = _area * -1;
          else
            _area = _area
          _area = _area * 0.0001;
          let _length = geometryEngine.geodesicLength(bc.PolygonGeom, "kilometers");
          if (_length < 0)
            _length = _length * -1;
          else
            _length = _length

          let _attr = {
            patch_id: 2, Length: _length.toFixed(4), Area: _area.toFixed(4),
            Ymin: bc.LineGeom.extent.ymin, Xmin: bc.LineGeom.extent.xmin,
            Ymax: bc.LineGeom.extent.ymax, Xmax: bc.LineGeom.extent.xmax
          }
          _userGraphic = new Graphic({
            id: 22,
            geometry: bc.PolygonGeom,
            symbol: CreateEsrisymbol("yellow", "red", "Fill", "solid"),
            attributes: _attr
          });
          this._customeGL.add(_userGraphic);
          if (this.qsData.ref_type.toUpperCase() == "FC") {
            _TextSymbol.text = bc.LineGeom == null ? 1 : 2;
            const _textGraphic = new Graphic();
            _textGraphic.geometry = bc.PolygonGeom.centroid;
            _textGraphic.symbol = _TextSymbol;
            _textGL.add(_textGraphic);
          }
        }
        data.children = this.childrenData;
        treeData.push(data);
        const TREE_DATA: LayerNode[] = treeData;
        this.parivesh.updateLayer(TREE_DATA);
        _this.PariveshGIS.ArcMap.layers.addMany([this._customeGL, _textGL]);
        _this.PariveshGIS.MapView.goTo({
          target: this._customeGL.graphics.items
        });
      }
      else {
        const data: any = { LayerName: "User KML", LayerID: 999, children: [] };
        for (let z = 0; z < app.KMLData.features.length; z++) {
          let _userGraphic = null;
          let _polyLineGeom = null;
          let _polygonGeom = null;
          if (app.KMLData.features[z].geometry.type.toLowerCase() === "linestring") {
            _polyLineGeom = new Polyline({
              paths: (app.KMLData.features[z].geometry.coordinates.length > 1) ? app.KMLData.features[z].geometry.coordinates : app.KMLData.features[z].geometry.coordinates[0],
              hasZ: false,
              hasM: false,
              spatialReference: { wkid: 4326 }
            });
            let _length = geometryEngine.geodesicLength(_polyLineGeom, "kilometers");
            if (_length < 0)
              _length = _length * -1;
            else
              _length = _length

            let _attr = {
              patch_id: z + 1, Length: _length.toFixed(4),
              Ymin: _polyLineGeom.extent.ymin, Xmin: _polyLineGeom.extent.xmin,
              Ymax: _polyLineGeom.extent.ymax, Xmax: _polyLineGeom.extent.xmax
            }
            _userGraphic = new Graphic({
              id: (Number(z) + Number(1)),
              geometry: _polyLineGeom,
              symbol: CreateEsrisymbol(app.KMLData.features[z].properties.hasOwnProperty("stroke") ? app.KMLData.features[z].properties.stroke : "[226, 119, 40]", "red", "Line", "solid"),
              attributes: _attr
            });
            if (this.qsData.ref_type.toUpperCase() == "FC") {
              _TextSymbol.text = z + 1;
              const _textGraphic = new Graphic();
              _textGraphic.geometry = _polyLineGeom.extent.center;
              _textGraphic.symbol = _TextSymbol;
              _textGL.add(_textGraphic);
            }
          }
          else if (app.KMLData.features[z].geometry.type.toLowerCase() == "polygon") {
            _polygonGeom = new Polygon({
              hasZ: true,
              hasM: false,
              rings: (app.KMLData.features[z].geometry.coordinates.length > 1) ? app.KMLData.features[z].geometry.coordinates : app.KMLData.features[z].geometry.coordinates[0],
              spatialReference: { wkid: 4326 }
            });
            let _area = geometryEngine.geodesicArea(_polygonGeom, "square-meters");
            if (_area < 0)
              _area = _area * -1;
            else
              _area = _area
            _area = _area * 0.0001;
            let _length = geometryEngine.geodesicLength(_polygonGeom, "kilometers");
            if (_length < 0)
              _length = _length * -1;
            else
              _length = _length

            let _attr = {
              patch_id: z + 1, Length: _length.toFixed(4), Area: _area.toFixed(4),
              Ymin: _polygonGeom.extent.ymin, Xmin: _polygonGeom.extent.xmin,
              Ymax: _polygonGeom.extent.ymax, Xmax: _polygonGeom.extent.xmax
            }

            _userGraphic = new Graphic({
              id: (Number(z) + Number(1)),
              geometry: _polygonGeom,
              symbol: CreateEsrisymbol(app.KMLData.features[z].properties.hasOwnProperty("stroke") ? app.KMLData.features[z].properties.stroke : "yellow", "red", "Fill", "solid"),
              attributes: _attr
            });
            if (this.qsData.ref_type.toUpperCase() == "FC") {
              _TextSymbol.text = z + 1;
              const _textGraphic = new Graphic();
              _textGraphic.geometry = _polygonGeom.centroid;
              _textGraphic.symbol = _TextSymbol;
              _textGL.add(_textGraphic);
            }
          }
          this._customeGL.add(_userGraphic);
          let tp: LayerNode = {} as LayerNode;
          tp.LayerName = app.KMLData.features[z].geometry.type.toUpperCase() + "-" + (Number(z) + Number(1));
          tp.LayerID = (Number(z) + Number(1));
          tp.LegendPath = createCanvasImage(app.KMLData.features[z].geometry.type.toLowerCase() == "polygon" ? "Rect" : "Line", "red");
          tp.reqType = "User";
          this.childrenData.push(tp);
          data.children = this.childrenData;
        }
        treeData.push(data);
        const TREE_DATA: LayerNode[] = treeData;
        this.parivesh.updateLayer(TREE_DATA);
        _this.PariveshGIS.MapView.when(function () {
          _this.PariveshGIS.ArcMap.layers.addMany([_this._customeGL, _textGL]);
          _this.PariveshGIS.MapView.goTo({
            target: _this._customeGL.graphics.items
          });
        }).catch(function (err: any) {
          console.error("MapView rejected:", err);
        });
      }
      this.kmlIntersection();
      return true;
    }
  }

  async kmlIntersection() {
    const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);

    this.villageBoundryLayer = new FeatureLayer({
      url: 'https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Administrative_Boundaries/MapServer/3',
      apiKey: newtokenbharatmaps__
    });

    this.toposheetBoundryLayer = new FeatureLayer({
      url: 'https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Grid50k_osm/MapServer/1',
      apiKey: newtokenbharatmaps__
    });

    const villagePointLayer = new FeatureLayer({
      url: 'https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/Village_Point_Grid/MapServer/0',
      apiKey: newtokenbharatmaps__
    });

    const subDistrictLayer = new FeatureLayer({
      url: 'https://gisservrsdiv.nic.in/bharatmaps/rest/services/parivesh2/SubDistrictGrid/MapServer/0',
      apiKey: newtokenbharatmaps__,
      visible: false
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
        this.intersectionResult = await fetchDataEsriService(query_inter, this.villageBoundryLayer);
        if (this.intersectionResult.features.length > 0)
          this.saveKmlIntersectionData(this.intersectionResult, this._customeGL.graphics.items[0]);
      }
      else {
        for (let index = 0; index < this._customeGL.graphics.items.length; index++) {
          query_inter.geometry = this.outofIndiaFlag ? this.goeBufferGeom : this._customeGL.graphics.items[index].geometry;
          this.intersectionResult = await fetchDataEsriService(query_inter, this.villageBoundryLayer);
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
          let subDistResult = await fetchDataEsriService(query, subDistrictLayer);
          let _costalstateName = ['gujarat', 'maharashtra', 'goa', 'karnataka', 'kerala', 'tamil nadu', 'odisha', 'west bengal', 'daman & diu', 'puducherry', 'andaman & nicobar', 'lakshadweep'];
          if (subDistResult.features.length > 0) {
            for (let t = 0; t < subDistResult.features.length; t++) {
              if (this.outofIndiaFlag) {
                if (_costalstateName.includes(subDistResult.features[t].attributes.stname) && response.features.length > 0) {
                  this.saveKmlIntersectionData(response, this._customeGL.graphics.items[0]);
                }
                else {
                  alert("Project Location Falling Out of India Boundary.");
                  break;
                }
              }
            }
          }
          else {
            alert("Project Location Falling Out of India Boundary.");
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
            let subdistResult = await fetchDataEsriService(query, subDistrictLayer);
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
        geoData.vilnamSoi = villnamesoi == null ? _villageName : (villnamesoi == undefined) ? "0" : villnamesoi;
        geoData.mapNo = mapNo.toString();
        geoData.stCode11 = _gisData.features[i].attributes.state_lgd === undefined ? _gisData.features[i].attributes.st_lgd.toString() : _gisData.features[i].attributes.state_lgd.toString();
        geoData.stName = stName;
        geoData.dtCode11 = _gisData.features[i].attributes.dt_lgd === undefined ? _gisData.features[i].attributes.dist_lgd.toString() : _gisData.features[i].attributes.dt_lgd.toString();
        geoData.dtName = dtName;
        geoData.sdtCode11 = _gisData.features[i].attributes.subdt_lgd === undefined ? _gisData.features[i].attributes.sdt_lgd.toString() : _gisData.features[i].attributes.subdt_lgd.toString();
        geoData.sdtName = _gisData.features[i].attributes.sdtname;
        geoData.vilName11 = villnamesoi == null ? _villageName : (villnamesoi == undefined) ? "0" : villnamesoi;
        geoData.version = this.qsData.version;
        geoDataArr.push(geoData);
      }
    }
    if (geoDataArr.length > 0)
      this.finalIntResult = [...this.finalIntResult, ...geoDataArr];
    if (this.counter == this._customeGL.graphics.items.length) {
      const res = await saveInterSectionResults(this.finalIntResult);

    }
  }
}
