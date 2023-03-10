var geojsonToArcGIS = function geojsonToArcGIS(geojson, idAttribute) {

  idAttribute = idAttribute || 'OBJECTID';
  var spatialReference = {
    wkid: 4326
  };
  var result = {};
  var i;
  var edgeIntersectsEdge = function edgeIntersectsEdge(a1, a2, b1, b2) {
    var uaT = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
    var ubT = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
    var uB = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

    if (uB !== 0) {
      var ua = uaT / uB;
      var ub = ubT / uB;

      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return true;
      }
    }

    return false;
  };
  var coordinatesContainPoint = function coordinatesContainPoint(coordinates, point) {
    var contains = false;

    for (var i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
      if ((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1] || coordinates[j][1] <= point[1] && point[1] < coordinates[i][1]) && point[0] < (coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0]) {
        contains = !contains;
      }
    }

    return contains;
  };
  var pointsEqual = function pointsEqual(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  };
  var arrayIntersectsArray = function arrayIntersectsArray(a, b) {
    for (var i = 0; i < a.length - 1; i++) {
      for (var j = 0; j < b.length - 1; j++) {
        if (edgeIntersectsEdge(a[i], a[i + 1], b[j], b[j + 1])) {
          return true;
        }
      }
    }

    return false;
  };

  /* Copyright (c) 2012-2019 Environmental Systems Research Institute, Inc.
   * Apache-2.0 */

  var closeRing = function closeRing(coordinates) {
    if (!pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
      coordinates.push(coordinates[0]);
    }

    return coordinates;
  }; // determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
  // or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
  // points-are-in-clockwise-order

  var ringIsClockwise = function ringIsClockwise(ringToTest) {
    var total = 0;
    var i = 0;
    var rLength = ringToTest.length;
    var pt1 = ringToTest[i];
    var pt2;

    for (i; i < rLength - 1; i++) {
      pt2 = ringToTest[i + 1];
      total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
      pt1 = pt2;
    }

    return total >= 0;
  }; // This function ensures that rings are oriented in the right directions
  // from http://jsperf.com/cloning-an-object/2

  var shallowClone = function shallowClone(obj) {
    var target = {};

    for (var i in obj) {
      // both arcgis attributes and geojson props are just hardcoded keys
      if (obj.hasOwnProperty(i)) {
        // eslint-disable-line no-prototype-builtins
        target[i] = obj[i];
      }
    }

    return target;
  };

  /* Copyright (c) 2012-2019 Environmental Systems Research Institute, Inc.
   * Apache-2.0 */

  var coordinatesContainCoordinates = function coordinatesContainCoordinates(outer, inner) {
    var intersects = arrayIntersectsArray(outer, inner);
    var contains = coordinatesContainPoint(outer, inner[0]);

    if (!intersects && contains) {
      return true;
    }

    return false;
  }; // do any polygons in this array contain any other polygons in this array?
  // used for checking for holes in arcgis rings


  var convertRingsToGeoJSON = function convertRingsToGeoJSON(rings) {
    var outerRings = [];
    var holes = [];
    var x; // iterator

    var outerRing; // current outer ring being evaluated

    var hole; // current hole being evaluated
    // for each ring

    for (var r = 0; r < rings.length; r++) {
      var ring = closeRing(rings[r].slice(0));

      if (ring.length < 4) {
        continue;
      } // is this ring an outer ring? is it clockwise?


      if (ringIsClockwise(ring)) {
        var polygon = [ring.slice().reverse()]; // wind outer rings counterclockwise for RFC 7946 compliance

        outerRings.push(polygon); // push to outer rings
      } else {
        holes.push(ring.slice().reverse()); // wind inner rings clockwise for RFC 7946 compliance
      }
    }

    var uncontainedHoles = []; // while there are holes left...

    while (holes.length) {
      // pop a hole off out stack
      hole = holes.pop(); // loop over all outer rings and see if they contain our hole.

      var contained = false;

      for (x = outerRings.length - 1; x >= 0; x--) {
        outerRing = outerRings[x][0];

        if (coordinatesContainCoordinates(outerRing, hole)) {
          // the hole is contained push it into our polygon
          outerRings[x].push(hole);
          contained = true;
          break;
        }
      } // ring is not contained in any outer ring
      // sometimes this happens https://github.com/Esri/esri-leaflet/issues/320


      if (!contained) {
        uncontainedHoles.push(hole);
      }
    } // if we couldn't match any holes using contains we can try intersects...


    while (uncontainedHoles.length) {
      // pop a hole off out stack
      hole = uncontainedHoles.pop(); // loop over all outer rings and see if any intersect our hole.

      var intersects = false;

      for (x = outerRings.length - 1; x >= 0; x--) {
        outerRing = outerRings[x][0];

        if (arrayIntersectsArray(outerRing, hole)) {
          // the hole is contained push it into our polygon
          outerRings[x].push(hole);
          intersects = true;
          break;
        }
      }

      if (!intersects) {
        outerRings.push([hole.reverse()]);
      }
    }

    if (outerRings.length === 1) {
      return {
        type: 'Polygon',
        coordinates: outerRings[0]
      };
    } else {
      return {
        type: 'MultiPolygon',
        coordinates: outerRings
      };
    }
  };

  var getId = function getId(attributes, idAttribute) {
    var keys = idAttribute ? [idAttribute, 'OBJECTID', 'FID'] : ['OBJECTID', 'FID'];

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];

      if (key in attributes && (typeof attributes[key] === 'string' || typeof attributes[key] === 'number')) {
        return attributes[key];
      }
    }

    throw Error('No valid id attribute found');
  };

  var orientRings = function orientRings(poly) {
    var output = [];
    var polygon = poly.slice(0);
    var outerRing = closeRing(polygon.shift().slice(0));

    if (outerRing.length >= 4) {
      if (!ringIsClockwise(outerRing)) {
        outerRing.reverse();
      }

      output.push(outerRing);

      for (var i = 0; i < polygon.length; i++) {
        var hole = closeRing(polygon[i].slice(0));

        if (hole.length >= 4) {
          if (ringIsClockwise(hole)) {
            hole.reverse();
          }

          output.push(hole);
        }
      }
    }

    return output;
  }; // This function flattens holes in multipolygons to one array of polygons
  // used for converting GeoJSON Polygons to ArcGIS Polygons


  var flattenMultiPolygonRings = function flattenMultiPolygonRings(rings) {
    var output = [];

    for (var i = 0; i < rings.length; i++) {
      var polygon = orientRings(rings[i]);

      for (var x = polygon.length - 1; x >= 0; x--) {
        var ring = polygon[x].slice(0);
        output.push(ring);
      }
    }

    return output;
  };

  switch (geojson.type) {
    case 'Point':
      result.x = geojson.coordinates[0];
      result.y = geojson.coordinates[1];

      if (geojson.coordinates[2]) {
        result.z = geojson.coordinates[2];
      }

      result.spatialReference = spatialReference;
      break;

    case 'MultiPoint':
      result.points = geojson.coordinates.slice(0);

      if (geojson.coordinates[0][2]) {
        result.hasZ = true;
      }

      result.spatialReference = spatialReference;
      break;

    case 'LineString':
      result.paths = [geojson.coordinates.slice(0)];

      if (geojson.coordinates[0][2]) {
        result.hasZ = true;
      }

      result.spatialReference = spatialReference;
      break;

    case 'MultiLineString':
      result.paths = geojson.coordinates.slice(0);

      if (geojson.coordinates[0][0][2]) {
        result.hasZ = true;
      }

      result.spatialReference = spatialReference;
      break;

    case 'Polygon':
      result.rings = orientRings(geojson.coordinates.slice(0));

      if (geojson.coordinates[0][0][2]) {
        result.hasZ = true;
      }

      result.spatialReference = spatialReference;
      break;

    case 'MultiPolygon':
      result.rings = flattenMultiPolygonRings(geojson.coordinates.slice(0));

      if (geojson.coordinates[0][0][0][2]) {
        result.hasZ = true;
      }

      result.spatialReference = spatialReference;
      break;

    case 'Feature':
      if (geojson.geometry) {
        result.geometry = geojsonToArcGIS(geojson.geometry, idAttribute);
      }

      result.attributes = geojson.properties ? shallowClone(geojson.properties) : {};

      if (geojson.id) {
        result.attributes[idAttribute] = geojson.id;
      }

      break;

    case 'FeatureCollection':
      result = [];
      for (i = 0; i < geojson.features.length; i++) {
        result.push(geojsonToArcGIS(geojson.features[i], idAttribute));
      }

      break;

    case 'GeometryCollection':
      result = [];

      for (i = 0; i < geojson.geometries.length; i++) {
        result.push(geojsonToArcGIS(geojson.geometries[i], idAttribute));
      }

      break;
  }

  return result;
};

var orientRings = function orientRings(poly) {
  var output = [];
  var polygon = poly.slice(0);
  var outerRing = closeRing(polygon.shift().slice(0));

  if (outerRing.length >= 4) {
    if (!ringIsClockwise(outerRing)) {
      outerRing.reverse();
    }

    output.push(outerRing);

    for (var i = 0; i < polygon.length; i++) {
      var hole = closeRing(polygon[i].slice(0));

      if (hole.length >= 4) {
        if (ringIsClockwise(hole)) {
          hole.reverse();
        }

        output.push(hole);
      }
    }
  }

  return output;
};