import { isLoaded, loadModules } from 'esri-loader';
import axios from 'axios';

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
    const res = axios.get("https://stgdev.parivesh.nic.in/ua-dev/gislayer/getlayerslist");
    return res;
};