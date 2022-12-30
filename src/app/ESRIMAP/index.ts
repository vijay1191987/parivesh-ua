import { isLoaded, loadModules } from 'esri-loader';
import { NICStreetmap, Terrain, Bharatmaps } from "./localConfigs";

const dojoConfig = {
  gfxRenderer: "svg,vml,canvas,silverlight",
  async: true,
  parseOnLoad: true,
  isDebug: false
  // packages: [
  //     {
  //         name: "DojoAPI",
  //         location: "https://nvmbd1bkh150v02.rjil.ril.com/arcgisapi/4.15/DojoAPI/"
  //     }
  // ]
};
const g = { version: 'next', css: true, dojoConfig: dojoConfig };

export const createGISInstance = async (_container: any) => {
  const [Basemap, WebTileLayer, Map, MapView] = await loadModules(["esri/Basemap", "esri/layers/WebTileLayer", "esri/Map", "esri/views/MapView"], g);
  const googleLayer = new WebTileLayer({
    urlTemplate: "https://mts{subDomain}.google.com/vt/lyrs=m@186112443&hl=x-local&src=app&x={col}&y={row}&z={level}&s=Galile",
    subDomains: ["0", "1", "2", "3"],
    copyright: "Google Maps - Parivesh",
    capabilities: "TilesOnly,Tilemap",
    exportTilesAllowed: true
  });
  const googleBasemap = new Basemap({
    baseLayers: [googleLayer],
    id: "Google_Basemap",
    thumbnailUrl: "https://jiogis.ril.com/JioMetryEnterprise/basemap/Images/map_ramp1.png",
    title: "Google Basemap"
  });
  const webmap = new Map({
    basemap: googleBasemap
  });
  const view = new MapView({
    id: "PariveshMapView",
    map: webmap,
    constraints: {
      rotationEnabled: false
    },
    center: [77.2324, 24.23423],
    zoom: 7,
    popup: {
      viewModel: {
        actions: {
          zoom: false
        },
        actionsMenuEnabled: false
      },
      dockEnabled: false,
      dockOptions: {
        breakpoint: false,
      }
    },
    navigation: {
      gamepad: {
        enabled: false
      },
      browserTouchPanEnabled: false,
      momentumEnabled: false
    },
    ui: {
      components: ["attribution"]
    },
    spatialReference: {
      wkid: 102100
    }  
  });
  view.container = _container;
  return { ArcMap: webmap, MapView: view };
};

export const DrawMapZoomOut = async (mapView: any, event: any) => {
  const [Draw, Extent, Point] = await loadModules(["esri/views/draw/Draw", "esri/geometry/Extent", "esri/geometry/Point"]);
  let action = null;
  const draw = new Draw({
    view: mapView
  });
  if (event === undefined) {
    mapView.surface.style.cursor = "zoom-out"; //url('assets/img/zoomin.cur'), auto
    mapView.graphics.removeAll();
    action = draw.create("rectangle");
    mapView.focus();
    action.on(["vertex-add", "cursor-update"], drawMapGraphics.bind(this, mapView));
    action.on("draw-complete", DrawMapZoomOut.bind(this, mapView));
  }
  if (isLoaded() && event !== undefined) {
    event.preventDefault();
    if (event.vertices.length === 1) {
      var pnt = new Point({ x: event.vertices[0][0], y: event.vertices[0][1], spatialReference: mapView.spatialReference });
      mapView.goTo({ target: pnt, scale: (mapView.scale * 2) });
      return;
    }
    var sx = event.vertices[0][0], sy = event.vertices[0][1];
    var ex = event.vertices[1][0], ey = event.vertices[1][1];
    var rect = {
      x: Math.min(sx, ex),
      y: Math.max(sy, ey),
      width: Math.abs(sx - ex),
      height: Math.abs(sy - ey),
      spatialReference: mapView.spatialReference
    };
    if (rect.width !== 0 || rect.height !== 0) {
      var scrPnt1 = mapView.toScreen(rect);
      var scrPnt2 = mapView.toScreen({ x: rect.x + rect.width, y: rect.y, spatialReference: rect.spatialReference });
      var mWidth = mapView.extent.width;
      var delta = (mWidth * mapView.width / Math.abs(scrPnt2.x - scrPnt1.x) - mWidth) / 2;
      var vExtent = mapView.extent;
      mapView.goTo(new Extent({
        xmin: vExtent.xmin - delta,
        ymin: vExtent.ymin - delta,
        xmax: vExtent.xmax + delta,
        ymax: vExtent.ymax + delta,
        spatialReference: vExtent.spatialReference
      }));
      draw.reset();
      mapView.surface.style.cursor = "default";
      mapView.graphics.removeAll();
    }
  }
}

export const DrawMapZoomIn = async (mapView: any, event: any) => {
  const [Draw, Extent] = await loadModules(["esri/views/draw/Draw", "esri/geometry/Extent"]);
  let action = null;
  const draw = new Draw({
    view: mapView
  });
  if (event === undefined) {
    mapView.surface.style.cursor = "zoom-in";
    mapView.graphics.removeAll();
    action = draw.create("rectangle");
    mapView.focus();
    action.on(["vertex-add", "cursor-update"], drawMapGraphics.bind(this, mapView));
    action.on("draw-complete", DrawMapZoomIn.bind(this, mapView));
  }
  if (isLoaded() && event !== undefined) {
    event.preventDefault();
    if (event.vertices.length === 1) {
      mapView.goTo({ scale: (mapView.scale * .5) });
      return;
    }
    let zoomExtent: any = getExtentfromVertices(event.vertices, mapView, Extent);
    zoomExtent.spatialReference = mapView.spatialReference;
    if (zoomExtent.width !== 0 || zoomExtent.height !== 0) {
      mapView.goTo({ extent: zoomExtent });
    }
    draw.reset();
    mapView.surface.style.cursor = "default";
    mapView.graphics.removeAll();
  }
}

export const changeBaseMap = async (event: any, ArcMap: any) => {
  let _baseMapLayer, _baseMapOBJ = null;
  const [Basemap, BingMapsLayer, MapImageLayer, WebTileLayer, TileLayer] = await loadModules(["esri/Basemap", "esri/layers/BingMapsLayer", 'esri/layers/MapImageLayer', "esri/layers/WebTileLayer", "esri/layers/TileLayer"]);

  switch (event) {
    case 'Bing':
      _baseMapLayer = new BingMapsLayer({
        style: "aerial",
        key: "Ag_mDFNXJ7s26uIQhN3T02lsiSzerxVmcUfCdAvsMAwIluiNwFABfrvge81w0O7T"
      });

      _baseMapOBJ = new Basemap({
        baseLayers: [_baseMapLayer],
        title: "Bing",
        id: "Bing-Map",
        thumbnailUrl: "D:\\Bing.jpeg"
      });

      ArcMap.basemap = _baseMapOBJ;
      break;

    case 'NIC_Street':
      _baseMapLayer = new MapImageLayer({
        url: "https://mapservice.gov.in/mapserviceserv176/rest/services/Street/StreetMap/MapServer",
        apiKey: NICStreetmap,
        minScale: 0,
        maxScale: 0,
        id: "Streetmap"
      });
      _baseMapOBJ = new Basemap({
        baseLayers: [_baseMapLayer],
        thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png",
        title: "Streetmap",
        id: "basemap_streetmap"
      });
      ArcMap.basemap = _baseMapOBJ;
      break;
    case 'NSatellite':
      _baseMapLayer = new MapImageLayer({
        url: "https://mapservice.gov.in/mapserviceserv176/rest/services/Street/StreetMap/MapServer",
        apiKey: NICStreetmap,
        minScale: 0,
        maxScale: 0,
        id: "Streetmap"
      });
      _baseMapOBJ = new Basemap({
        baseLayers: [_baseMapLayer],
        thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png",
        title: "Streetmap",
        id: "basemap_streetmap"
      });
      ArcMap.basemap = _baseMapOBJ
      break;

    case 'gStreet':
      const Mglayer = "m";
      _baseMapLayer = new WebTileLayer({
        urlTemplate: "https://mts{subDomain}.google.com/vt/lyrs=" + Mglayer + "@186112443&hl=x-local&src=app&x={col}&y={row}&z={level}&s=Galile",
        subDomains: ["0", "1", "2", "3"],
        copyright: event === "Satellite" ? "Google Imagery - Parivesh" : "Google Maps - Parivesh",
        capabilities: "TilesOnly,Tilemap",
        exportTilesAllowed: true
      });
      _baseMapOBJ = new Basemap({
        baseLayers: [_baseMapLayer],
        id: "Google_Basemap",
        thumbnailUrl: "https://jiogis.ril.com/JioMetryEnterprise/basemap/Images/map_ramp1.png",
        title: "Google Basemap"
      });
      ArcMap.basemap = _baseMapOBJ;
      break;

    case 'gSatellite':
      const glayer = "s";
      _baseMapLayer = new WebTileLayer({
        urlTemplate: "https://mts{subDomain}.google.com/vt/lyrs=" + glayer + "@186112443&hl=x-local&src=app&x={col}&y={row}&z={level}&s=Galile",
        subDomains: ["0", "1", "2", "3"],
        copyright: event === "Satellite" ? "Google Imagery - Parivesh" : "Google Maps - Parivesh",
        capabilities: "TilesOnly,Tilemap",
        exportTilesAllowed: true
      });
      _baseMapOBJ = new Basemap({
        baseLayers: [_baseMapLayer],
        id: "Google_Basemap",
        thumbnailUrl: "https://jiogis.ril.com/JioMetryEnterprise/basemap/Images/map_ramp1.png",
        title: "Google Basemap"
      });
      ArcMap.basemap = _baseMapOBJ;
      break;

    case 'Terrain':
      _baseMapLayer = new MapImageLayer({
        url: "https://webgis1.nic.in/publishing/rest/services/bharatmaps/terrain2019/MapServer",
        apiKey: Terrain,
        minScale: 0,
        maxScale: 0,
        id: "Terrain"
      });

      _baseMapOBJ = new Basemap({
        baseLayers: [_baseMapLayer],//
        thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/410.png",
        title: "Terrain",
        id: "basemap_terrain"
      });
      ArcMap.basemap = _baseMapOBJ;
      break;

    case 'Topo':
      _baseMapLayer = new MapImageLayer({
        url: "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer",
        minScale: 0,
        maxScale: 0,
        id: "WorldTopo"
      });
      _baseMapOBJ = new Basemap({
        baseLayers: [_baseMapLayer],//
        thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/413.png",
        title: "WorldTopo",
        id: "basemap_WorldTopo"
      });

      ArcMap.basemap = _baseMapOBJ;
      break;

    case 'ESatellite':
      _baseMapLayer = new TileLayer({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
        minScale: 0,
        maxScale: 0,
        id: "EsriSatillite"
      });
      _baseMapOBJ = new Basemap({
        baseLayers: [_baseMapLayer],//
        thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/412.png",
        title: "ESRISatillite",
        id: "basemap_ESRISatillite"
      });
      ArcMap.basemap = _baseMapOBJ;
      break;

    default: ArcMap.basemap = null;
  }


}

async function drawMapGraphics(mapView: any, event: any) {
  const [Graphic, Extent] = await loadModules(["esri/Graphic", "esri/geometry/Extent"]);
  var vertices = event.vertices;
  //remove existing graphic
  event.view.graphics.removeAll();
  if (vertices.length < 2) {
    return;
  }
  // create a new extent
  var extent: any = getExtentfromVertices(vertices, mapView, Extent);
  extent.spatialReference = event.view.spatialReference;
  event.view.graphics.remove();
  var graphic = new Graphic({
    geometry: extent,
    symbol: {
      type: "simple-fill",
      color: [0, 0, 0, 0.2],
      style: "solid",
      outline: {
        color: [255, 0, 0],
        width: 1
      }
    }
  });
  event.view.graphics.add(graphic);
}

function getExtentfromVertices(vertices: any, MapView: any, Extent: any): any {
  var sx = vertices[0][0], sy = vertices[0][1];
  var ex = vertices[1][0], ey = vertices[1][1];
  var rect: any = {
    x: Math.min(sx, ex),
    y: Math.max(sy, ey),
    width: Math.abs(sx - ex),
    height: Math.abs(sy - ey),
    spatialReference: MapView.spatialReference
  };
  if (rect.width !== 0 || rect.height !== 0) {
    return new Extent({
      xmin: parseFloat(rect.x),
      ymin: parseFloat(rect.y) - parseFloat(rect.height),
      xmax: parseFloat(rect.x) + parseFloat(rect.width),
      ymax: parseFloat(rect.y),
      spatialReference: rect.spatialReference
    });
  } else {
    return null;
  }
}
