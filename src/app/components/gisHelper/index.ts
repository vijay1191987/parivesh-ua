import { isLoaded, loadModules } from 'esri-loader';
import axios from 'axios';
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
import { LayerNode } from './../layers/layers.component'
import { CAFInsertAPI, proposalAPI } from './localConfigs';

/*****************************************************************
 <<<<< COMMON FUNCTION TO RE-USE IN ENTIRE APPLICATION >>>>>
*****************************************************************/

// return the user data from the local storage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  else return null;
}
export const getToken = () => {
  return localStorage.getItem('token') || null;
}

export const convertDate = (inputFormat: any) => {
  function pad(s: any) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat)
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/')
}

export const removeUserSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.clear();
}

export function sliceTimeseriesFromEnd(timeseries: any, days: any) {
  return timeseries;
}

export const createFillSymbol = (color: any, style: any, width: any, outlineColor: any) => {
  return {
    type: "simple-fill",
    style: style,
    color: color,
    outline: {
      color: outlineColor,
      width: width
    }
  };
};

export const checkEnableLayer = (layerTile: any, mapLayers: any) => {
  return mapLayers.find(function (layer: any) {
    if (layer.title != null) {
      if (layer.title.toUpperCase().includes(layerTile.toUpperCase()))
        return layer;
    }
  });
};
export const encodeJSONFormData = (data: any) => {
  return Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
}
export const formatNumber = (value: any) => {
  const numberFormatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  });
  return isNaN(value) ? '-' : numberFormatter.format(value);
};
export const capitalize = (s: string) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const capitalizeAll = (s: string) => {
  if (typeof s !== 'string') return '';
  const str = s.toLowerCase().split(' ');
  for (let i = 0; i < str.length; i++) {
    str[i] = capitalize(str[i]);
  }
  return str.join(' ');
};

export const getMonthDays = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

export const abbreviate = (s: string) => {
  return s.slice(0, 1) + s.slice(1).replace(/[aeiou]/gi, '');
};

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
export const precisionRound = (number: any, precision: any) => {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

export const showQueryResultonMap = async (featureSET: any, mapView: any) => {
  mapView.map.removeAll();
  if (isLoaded()) {
    const [GraphicsLayer] = await loadModules(["esri/layers/GraphicsLayer"]);
    const glayer = new GraphicsLayer({
      id: "queryLayer",
      graphics: featureSET.features
    });
    mapView.map.addMany([glayer]);
    mapView.goTo({ target: glayer, zoom: 9 }); //extent: glayer.fullExtent
  }
};

export const mapPointerCords = (p: any, m: any) => {
  let coords = null;
  if (p === null)
    coords = m.center.latitude.toFixed(4) + ", " + m.center.longitude.toFixed(4);
  else
    coords = p.latitude.toFixed(4) + ", " + p.longitude.toFixed(4);
  return coords;
};

export const groupByJsonData = (_data: any, key: any) => {
  return _data.reduce(function (rv: any, x: any) {
    (rv[x[key].trim()] = rv[x[key].trim()] || []).push(x);
    return rv;
  }, {});
};

export const renameJSONKey = (obj: any, oldKey: any, newKey: any) => {
  if (oldKey === "ggllayerid") {
    let lyrID: number = 0;
    const n = obj.layerurl.trim().slice(-5).match(/\d/g);
    if (n !== null)
      lyrID = parseInt(n.join(""));
    else
      lyrID = obj[oldKey];
    obj[newKey] = lyrID;
  }
  else
    obj[newKey] = obj[oldKey];
  delete obj[oldKey];
};

export const createMapImageLayer = async (_props: any) => {
  const [MapImageLayer] = await loadModules(["esri/layers/MapImageLayer"]);
  let layer = new MapImageLayer(_props);
  return layer;
};
export const getLayerMasters = async () => {
  return axios({
    url: "https://stgdev.parivesh.nic.in/ua-dev/gislayer/getlayerslist",
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const saveInterSectionResults = async (_d: any) => {
  return axios({
    url: CAFInsertAPI,
    method: 'post',
    data: _d,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const queryOKM = async (_URL: any, _d: object = {}) => {
  return axios({
    url: _URL,
    method: 'get',
    responseType: 'document',
    params: _d,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const checkKMLGEOJSON = (_jsonData: any) => {
  let _finalJSONData = [];
  const bc: any = {
    type: "FeatureCollection", features: [], LineGeom: [], PolygonGeom: [], hasPointData: false
  };
  for (let i = 0; i < _jsonData.features.length; i++) {
    if (_jsonData.features[i].geometry.hasOwnProperty("geometries")) {
      for (let j = 0; j < _jsonData.features[i].geometry.geometries.length; j++) {
        const ab: any = {
          "type": "Feature", "id": null, geometry: null, properties: {
            prop0: "value0",
          }
        };
        if (_jsonData.features[i].geometry.geometries[j].type.toLowerCase() == 'point') {
          bc.hasPointData = true;
          break;
        }
        else if (_jsonData.features[i].geometry.geometries[j].type.toLowerCase() == "linestring") {
          const _line = new Polyline({
            paths: _jsonData.features[i].geometry.geometries[j].coordinates,
            hasZ: false,
            hasM: false,
            spatialReference: { wkid: 4326 }
          });
          bc.LineGeom.push(_line);
        }
        else if (_jsonData.features[i].geometry.geometries[j].type.toLowerCase() == "polygon" && _jsonData.features[i].geometry.geometries[j].coordinates.length > 0) {
          const _poly = new Polygon({
            rings: _jsonData.features[i].geometry.geometries[j].coordinates,
            hasZ: false,
            hasM: false,
            spatialReference: { wkid: 4326 }
          });
          bc.PolygonGeom.push(_poly);
        }
        ab.id = "Feat" + j;
        ab.geometry = _jsonData.features[i].geometry.geometries[j];
        _finalJSONData.push(ab);
      }
    }
    else {
      if (_jsonData.features[i].geometry.type == 'Point') {
        localStorage.setItem("checkPointLayer", 'yes');
        break;
      }
      else if (_jsonData.features[i].geometry.type.toLowerCase() == "linestring" && _jsonData.features[i].geometry.coordinates.length > 0) {
        const _line = new Polyline({
          paths: _jsonData.features[i].geometry.coordinates,
          hasZ: false,
          hasM: false,
          spatialReference: { wkid: 4326 }
        });
        bc.LineGeom.push(_line);
      }
      else if (_jsonData.features[i].geometry.type.toLowerCase() == "polygon" && _jsonData.features[i].geometry.coordinates.length > 0) {
        const _poly = new Polygon({
          rings: _jsonData.features[i].geometry.coordinates,
          hasZ: false,
          hasM: false,
          spatialReference: { wkid: 4326 }
        });
        bc.PolygonGeom.push(_poly);
      }
      _finalJSONData.push(_jsonData.features[i]);
    }
  }
  bc.features = _finalJSONData;
  return bc;
}
export const CreateEsrisymbol = (_color: string, _outlinecolor: string, _type: string, _style: string) => {
  let _symbol = null;
  if (_type == "Fill") {
    _symbol = {
      style: _style,
      type: "simple-fill",  // autocasts as new SimpleFillSymbol()
      color: _color,
      outline: {  // autocasts as new SimpleLineSymbol()
        color: _outlinecolor,
        width: 2
      }
    };
  }
  else if (_type == "Marker") {
    _symbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      size: 16,
      color: _color,
      path: _outlinecolor
    };
  }
  else {
    _symbol = {
      type: "simple-line",
      color: _color,
      outline: 4,
      width: 4
    };
  }
  return _symbol;
}
export const fetchDataEsriService = async (params: any, _URL: any) => {
  const abcd = await _URL.queryFeatures(params).then(function (resultsAdministrative_inner: any) {
    return resultsAdministrative_inner;
  }).catch((error: any) => {
    console.log(error);
  });
  return abcd;
}
export const _TextSymbol: any = {
  type: "text",  // autocasts as new TextSymbol()
  color: "white",
  haloColor: "black",
  haloSize: "1px",
  xoffset: 3,
  yoffset: 3,
  font: {  // autocasts as new Font()
    size: 12,
    family: "sans serif",
    weight: "bold"
  }
};

export const createCanvasImage = (_type: any, _color: any) => {
  let _img64: string = '';
  const canvas = document.createElement('canvas');
  const context: any = canvas.getContext("2d");
  const image = new Image();
  canvas.width = 20;
  canvas.height = 20;
  if (_type === "Rect") {
    context.beginPath();
    context.strokeStyle = _color;
    context.lineWidth = 3;
    context.strokeRect(0, 0, 20, 20);
    // context.stroke();
    context.drawImage(image, 0, 0, 20, 20);
  }
  else if (_type === "Line") {
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(20, 20);
    context.lineWidth = 2;
    context.strokeStyle = _color;
    context.stroke();
    context.drawImage(image, 0, 0, 20, 20);
  }
  _img64 = canvas.toDataURL();
  return _img64;
}


export const createKMLGraphics = async (_kmlData: any, _qsData: any = null, _featIndex: any = null) => {
  const [GraphicsLayer, Graphic, geometryEngine, Polyline, Polygon, PopupTemplate] = await loadModules(['esri/layers/GraphicsLayer', 'esri/Graphic', 'esri/geometry/geometryEngine', "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/PopupTemplate"]);
  const _outData: any = {};
  const _customeGL = new GraphicsLayer({
    UUID: _qsData.uuid,
    id: _featIndex === null ? "EsriUserKML" : "EsriUserKML_" + _qsData.uploadedname.replace(' ', ''),
    title: _featIndex === null ? "EsriUserKML_Main_KML" : "EsriUserKML_" + _qsData.docname + "_" + _qsData.uploadedname.replace(' ', ''),
    legendEnable: true,
    listMode: "hide",
    effect: [
      {
        scale: 178595,
        value: "drop-shadow(3px, 3px, 4px)"
      },
      {
        scale: 89297,
        value: "drop-shadow(2px, 2px, 3px)"
      },
      {
        scale: 12324,
        value: "drop-shadow(1px, 1px, 2px)"
      }
    ]
  });
  const _textGL = new GraphicsLayer();
  let childrenData = [];
  let treeData: any[] = [];
  let _kmlFeature = [];
  if (_kmlData.features.length >= 50) {
    childrenData = [];
    const bc: any = {
      type: "FeatureCollection", features: [], featureExceed: true, LineGeom: _kmlData.LineGeom.length > 0 ? geometryEngine.union(_kmlData.LineGeom) : null, PolygonGeom: _kmlData.PolygonGeom.length > 0 ? geometryEngine.union(_kmlData.PolygonGeom) : null
    };
    if (_kmlData.LineGeom.length > 0) {
      _kmlFeature.push({
        "type": "Feature", "id": 1, geometry: { coordinates: [bc.LineGeom.paths], type: "LineString" }, properties: _kmlData.features[0].properties
      });
    }
    if (_kmlData.PolygonGeom.length > 0) {
      _kmlFeature.push({
        "type": "Feature", "id": 2, geometry: { coordinates: [bc.PolygonGeom.rings], type: "Polygon" }, properties: _kmlData.features[0].properties
      });
    }
    if (bc.LineGeom === null)
      delete bc.LineGeom;
    if (bc.PolygonGeom === null)
      delete bc.PolygonGeom;

    bc.features = _kmlFeature;
    _kmlData = bc;
    let _userGraphic = null;
    const data: any = { LayerName: "User KML", selected: true, LayerID: 999, children: [] };
    if (bc.LineGeom != null) {
      let tp: LayerNode = {} as LayerNode;
      tp.LayerName = "Line Feature";
      tp.LayerID = 11;
      tp.selected = true;
      tp.LegendPath = createCanvasImage("Line", "red");
      tp.reqType = "CAF";
      childrenData.push(tp);

      let _length = geometryEngine.geodesicLength(bc.LineGeom, "kilometers");
      if (_length < 0)
        _length = _length * -1;
      else
        _length = _length

      let _attr = {
        patch_id: 1, Length: _length.toFixed(4),
        Ymin: bc.LineGeom.extent.ymin, Xmin: bc.LineGeom.extent.xmin,
        Ymax: bc.LineGeom.extent.ymax, Xmax: bc.LineGeom.extent.xmax,
        Description: _kmlData.features[0].properties.hasOwnProperty('description') ? _kmlData.features[0].properties.description : "No Information"
      }

      _userGraphic = new Graphic({
        id: 11,
        geometry: bc.LineGeom,
        symbol: CreateEsrisymbol("[226, 119, 40]", "red", "Line", "solid"),
        attributes: _attr
      });
      _userGraphic.popupTemplate = new PopupTemplate({
        title: "KML Information",
        content: [{
          type: "fields",
          fieldInfos: [{
            fieldName: "patch_id",
            label: "Patch ID"
          },
          {
            fieldName: "Length",
            label: "Length(Km)"
          },
          {
            fieldName: "Description",
            label: "Description"
          }]
        }]
      });
      if (_qsData.hasOwnProperty('ref_type')) {
        if (_qsData.ref_type.toUpperCase() == "FC") {
          _TextSymbol.text = 1;
          const _textGraphic = new Graphic();
          _textGraphic.geometry = bc.LineGeom.extent.center;
          _textGraphic.symbol = _TextSymbol;
          _textGL.add(_textGraphic);
        }
      }
      _customeGL.add(_userGraphic);
    }
    if (bc.PolygonGeom != null) {
      let tp: LayerNode = {} as LayerNode;
      tp.LayerName = "Polygon Feature";
      tp.LayerID = 22;
      tp.selected = true;
      tp.LegendPath = createCanvasImage("Rect", "red");
      tp.reqType = "CAF";
      childrenData.push(tp);

      let _area = geometryEngine.geodesicArea(bc.PolygonGeom, "square-kilometers");
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
        Ymin: bc.PolygonGeom.extent.ymin, Xmin: bc.PolygonGeom.extent.xmin,
        Ymax: bc.PolygonGeom.extent.ymax, Xmax: bc.PolygonGeom.extent.xmax,
        Description: _kmlData.features[0].properties.hasOwnProperty('description') ? _kmlData.features[0].properties.description : "No Information"
      }
      _userGraphic = new Graphic({
        id: 22,
        geometry: bc.PolygonGeom,
        symbol: CreateEsrisymbol("yellow", "red", "Fill", "solid"),
        attributes: _attr
      });
      _userGraphic.popupTemplate = new PopupTemplate({
        title: "KML Information",
        content: [{
          type: "fields",
          fieldInfos: [{
            fieldName: "patch_id",
            label: "Patch ID"
          },
          {
            fieldName: "Area",
            label: "Area(Km)"
          },
          {
            fieldName: "Length",
            label: "Length(Km)"
          },
          {
            fieldName: "Description",
            label: "Description"
          }]
        }]
      });
      _customeGL.add(_userGraphic);
      if (_qsData.hasOwnProperty('ref_type')) {
        if (_qsData.ref_type.toUpperCase() == "FC") {
          _TextSymbol.text = bc.LineGeom == null ? 1 : 2;
          const _textGraphic = new Graphic();
          _textGraphic.geometry = bc.PolygonGeom.centroid;
          _textGraphic.symbol = _TextSymbol;
          _textGL.add(_textGraphic);
        }
      }
    }
    data.children = childrenData;
    treeData.push(data);
    const TREE_DATA: LayerNode[] = treeData;
    _outData.GL = _customeGL;
    _outData.TL = _textGL;
    _outData.TD = TREE_DATA;
  }
  else {
    const data: any = { LayerName: "User KML", selected: true, LayerID: 999, children: [] };
    for (let z = 0; z < _kmlData.features.length; z++) {
      let _userGraphic = null;
      let _polyLineGeom = null;
      let _polygonGeom = null;
      if (_kmlData.features[z].geometry.type.toLowerCase() === "linestring") {
        _polyLineGeom = new Polyline({
          paths: (_kmlData.features[z].geometry.coordinates.length > 1) ? _kmlData.features[z].geometry.coordinates : _kmlData.features[z].geometry.coordinates[0],
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
          Ymax: _polyLineGeom.extent.ymax, Xmax: _polyLineGeom.extent.xmax,
          Description: _kmlData.features[z].properties.hasOwnProperty('description') ? _kmlData.features[z].properties.description : "No Information"
        }
        _userGraphic = new Graphic({
          id: (Number(z) + Number(1)),
          geometry: _polyLineGeom,
          symbol: CreateEsrisymbol(_kmlData.features[z].properties.hasOwnProperty("styleHash") ? "#" + _kmlData.features[z].properties.styleHash.slice(-6) : "[226, 119, 40]", "red", "Line", "solid"),
          attributes: _attr
        });
        _userGraphic.popupTemplate = new PopupTemplate({
          title: "KML Information",
          content: [{
            type: "fields",
            fieldInfos: [{
              fieldName: "patch_id",
              label: "Patch ID"
            },
            {
              fieldName: "Length",
              label: "Length(Km)"
            },
            {
              fieldName: "Description",
              label: "Description"
            }]
          }]
        });
        if (_qsData.hasOwnProperty('ref_type')) {
          if (_qsData.ref_type.toUpperCase() == "FC") {
            _TextSymbol.text = z + 1;
            const _textGraphic = new Graphic();
            _textGraphic.geometry = _polyLineGeom.extent.center;
            _textGraphic.symbol = _TextSymbol;
            _textGL.add(_textGraphic);
          }
        }
      }
      else if (_kmlData.features[z].geometry.type.toLowerCase() == "polygon") {
        _polygonGeom = new Polygon({
          hasZ: true,
          hasM: false,
          rings: (_kmlData.features[z].geometry.coordinates.length > 1) ? _kmlData.features[z].geometry.coordinates : _kmlData.features[z].geometry.coordinates[0],
          spatialReference: { wkid: 4326 }
        });
        let _area = geometryEngine.geodesicArea(_polygonGeom, "square-kilometers");
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
          Ymax: _polygonGeom.extent.ymax, Xmax: _polygonGeom.extent.xmax,
          Description: _kmlData.features[z].properties.hasOwnProperty('description') ? _kmlData.features[z].properties.description : "No Information"
        }

        _userGraphic = new Graphic({
          id: (Number(z) + Number(1)),
          geometry: _polygonGeom,
          symbol: CreateEsrisymbol(_kmlData.features[z].properties.hasOwnProperty("styleHash") ? "#" + _kmlData.features[z].properties.styleHash.slice(-6) : "yellow", "red", "Fill", "solid"),
          attributes: _attr
        });
        _userGraphic.popupTemplate = new PopupTemplate({
          title: "KML Information",
          content: [{
            type: "fields",
            fieldInfos: [{
              fieldName: "patch_id",
              label: "Patch ID"
            },
            {
              fieldName: "Area",
              label: "Area(Km)"
            },
            {
              fieldName: "Length",
              label: "Length(Km)"
            },
            {
              fieldName: "Description",
              label: "Description"
            }]
          }]
        });
        if (_qsData.hasOwnProperty('ref_type')) {
          if (_qsData.ref_type.toUpperCase() == "FC") {
            _TextSymbol.text = z + 1;
            const _textGraphic = new Graphic();
            _textGraphic.geometry = _polygonGeom.centroid;
            _textGraphic.symbol = _TextSymbol;
            _textGL.add(_textGraphic);
          }
        }
      }
      _customeGL.add(_userGraphic);
      let tp: LayerNode = {} as LayerNode;
      tp.LayerName = "PATCH -" + (Number(z) + Number(1)); //_kmlData.features[z].geometry.type.toUpperCase() +
      tp.LayerID = (Number(z) + Number(1));
      tp.selected = true;
      tp.LegendPath = createCanvasImage(_kmlData.features[z].geometry.type.toLowerCase() == "polygon" ? "Rect" : "Line", "red");
      tp.reqType = "CAF";
      childrenData.push(tp);
      data.children = childrenData;
    }
    treeData.push(data);
    const TREE_DATA: LayerNode[] = treeData;
    _outData.GL = _customeGL;
    _outData.TL = _textGL;
    if (_qsData.hasOwnProperty('ref_type'))
      _outData.TD = TREE_DATA;
  }
  return _outData;
}


export const getProposalDetails = async (_d: any) => {
  return axios({
    url: proposalAPI,
    method: 'get',
    params: _d,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (response) {
    return response;
  })
    .catch(function (error) {
      return error;
    })
};

export const getUserKMLFromTree = (node: any) => {
  if (node.children) {
    return node.children.map((element: any) => {
      if (element.children)
        return getUserKMLFromTree(element);
      else
        return element.LayerName;
    });
  }
}
