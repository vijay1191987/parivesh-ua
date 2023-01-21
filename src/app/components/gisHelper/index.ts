import { isLoaded, loadModules } from 'esri-loader';
import axios from 'axios';
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
import { AsyncAction } from 'rxjs/internal/scheduler/AsyncAction';
import { async } from '@angular/core/testing';
import { retry } from 'rxjs';

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
        if (layer.title === layerTile)
            return layer;
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
        mapView.goTo({ target: glayer, zoom: 8 }); //extent: glayer.fullExtent
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
        url: "https://stgdev.parivesh.nic.in/gis-dev/api/InsertOutData",
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
                        paths: _jsonData.features[i].geometry.coordinates,
                        hasZ: false,
                        hasM: false,
                        spatialReference: { wkid: 4326 }
                    });
                    bc.LineGeom.push(_line);
                }
                else if (_jsonData.features[i].geometry.geometries[j].type.toLowerCase() == "polygon" && _jsonData.features[i].geometry.geometries[j].coordinates.length > 0) {
                    const _poly = new Polygon({
                        rings: _jsonData.features[i].geometry.coordinates,
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