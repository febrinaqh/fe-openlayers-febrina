/*
 * Copyright Intern MSIB6 @ PT Len Industri (Persero)
 *
 * THIS SOFTWARE SOURCE CODE AND ANY EXECUTABLE DERIVED THEREOF ARE PROPRIETARY
 * TO PT LEN INDUSTRI (PERSERO), AS APPLICABLE, AND SHALL NOT BE USED IN ANY WAY
 * OTHER THAN BEFOREHAND AGREED ON BY PT LEN INDUSTRI (PERSERO), NOR BE REPRODUCED
 * OR DISCLOSED TO THIRD PARTIES WITHOUT PRIOR WRITTEN AUTHORIZATION BY
 * PT LEN INDUSTRI (PERSERO), AS APPLICABLE.
 *
 * Created Date: Sunday, March 24nd 2024, 10:46:45 am
 * Author: Febrina Qoonitah | febrina231@gmail.com <https://github.com/febrinaqh>
 *
 */

import { useEffect, useRef } from "react";
import { FaSearchPlus, FaSearchMinus, FaGripHorizontal } from "react-icons/fa";
import { BiPolygon } from "react-icons/bi";
import { PiLineSegmentFill } from "react-icons/pi";
import { Draw, Modify } from "ol/interaction.js";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { LineString, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { easeOut } from "ol/easing.js";

import { FloatingButton } from "../button/FloatingButton";
import { HiOutlineLocationMarker } from "react-icons/hi";
import {
  labelStyle,
  iconStyle,
  modifyStyle,
  segmentStyle,
  style,
  tipStyle,
} from "../data/MarkerStyle";
import { formatArea, formatLength } from "../../utils/format/formatMap";

/**
 * Initializes a map component with an OpenStreetMap layer and a default view.
 *
 * @return {JSX.Element} A div element containing the map component.
 */
const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorSourceRef = useRef(null);
  const vectorRef = useRef(null);
  const tipPointRef = useRef(null);
  const modifyRef = useRef(null);
  const tileLayer = useRef(null);

  const segmentStyles = [segmentStyle];

  useEffect(() => {
    const tile = new TileLayer({
      source: new OSM({
        url: "https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      }),
    });

    const source = new VectorSource();
    const vector = new VectorLayer({
      source: source,
      style: [
        (feature) => styleFunction(tipPointRef, modifyRef, feature),
        iconStyle,
      ],
    });
    const modify = new Modify({ source: source, style: modifyStyle });

    const map = new Map({
      target: mapRef.current,
      layers: [tile, vector],
      view: new View({
        center: fromLonLat([107.60981, -6.914744]),
        zoom: 10,
      }),
      controls: [],
    });

    map.addInteraction(modify);

    mapInstance.current = map;
    vectorSourceRef.current = source;
    vectorRef.current = vector;
    modifyRef.current = modify;
    tileLayer.current = tile;

    source.on("addfeature", function (e) {
      flash(e.feature);
    });

    return () => {
      map.setTarget(undefined);
    };
  });

  /**
   * Handles zooming in or out of the map.
   * @param {React.MutableRefObject<Map>} mapRef - Reference to the map instance.
   * @param {number} value - Zoom level adjustment.
   */

  const handleZoom = (mapRef, value) => {
    const map = mapRef.current;
    const view = map.getView();
    const zoom = view.getZoom();
    view.animate({ zoom: zoom + value, duration: 500 });
  };

  /**
   * Applies appropriate styles to features based on their type.
   * @param {React.MutableRefObject<Geometry>} tipPointRef - Reference to the tip point geometry.
   * @param {React.MutableRefObject<Modify>} modifyRef - Reference to the modify interaction.
   * @param {Feature} feature - The feature to style.
   * @param {string} [drawType] - The type of drawing.
   * @param {string} [tip] - Tip message.
   * @returns {Array<Style>} An array of styles for the feature.
   */

  function styleFunction(tipPointRef, modifyRef, feature, drawType, tip) {
    const styles = [];
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    let point, label, line;
    if (!drawType || drawType === type || type === "Point") {
      styles.push(style);
      if (type === "Polygon") {
        point = geometry.getInteriorPoint();
        label = formatArea(geometry);
        line = new LineString(geometry.getCoordinates()[0]);
      } else if (type === "LineString") {
        point = new Point(geometry.getLastCoordinate());
        label = formatLength(geometry);
        line = geometry;
      }
    }
    if (line) {
      let count = 0;
      line.forEachSegment(function (a, b) {
        const segment = new LineString([a, b]);
        const label = formatLength(segment);
        if (segmentStyles.length - 1 < count) {
          segmentStyles.push(segmentStyle.clone());
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        segmentStyles[count].setGeometry(segmentPoint);
        segmentStyles[count].getText().setText(label);
        styles.push(segmentStyles[count]);
        count++;
      });
    }
    if (label) {
      labelStyle.setGeometry(point);
      labelStyle.getText().setText(label);
      styles.push(labelStyle);
    }
    if (
      tip &&
      type === "Point" &&
      !modifyRef.current.getOverlay().getSource().getFeatures().length
    ) {
      tipPointRef.current = geometry;
      tipStyle.getText().setText(tip);
      styles.push(tipStyle);
    }
    return styles;
  }

  /**
   * Adds drawing interactions to the map.
   * @param {VectorSource} source - Vector source for drawing.
   * @param {Map} map - Map instance.
   * @param {string} type - Type of interaction (e.g., "Polygon", "LineString").
   */

  function addInteractions(source, map, type) {
    map.removeInteraction(vectorRef.current);
    const activeTip =
      "Click to continue drawing the " +
      (type === "Polygon" ? "polygon" : "line");
    const idleTip = "Click to start measuring";
    let tip = idleTip;
    vectorRef.current = new Draw({
      source,
      type,
      style: function (feature) {
        return styleFunction(tipPointRef, modifyRef, feature, type, tip);
      },
    });
    vectorRef.current.on("drawstart", function () {
      modifyRef.current.setActive(false);
      tip = activeTip;
    });
    vectorRef.current.on("drawend", function () {
      modifyStyle.setGeometry(tipPointRef.current);
      modifyRef.current.setActive(true);
      map.once("pointermove", function () {
        modifyStyle.setGeometry();
      });
      tip = idleTip;
    });
    modifyRef.current.setActive(true);
    map.addInteraction(vectorRef.current);
  }

  /**
   * Creates a flashing effect on a feature.
   * @param {Feature} feature - The feature to flash.
   */

  const flash = (feature) => {
    const duration = 3000;
    const start = Date.now();
    const flashGeom = feature.getGeometry().clone();
    const listenerKey = tileLayer.current.on("postrender", animate);

    function animate(event) {
      const frameState = event.frameState;
      const elapsed = frameState.time - start;
      const vectorContext = getVectorContext(event);
      const elapsedRatio = elapsed / duration;
      const radius = easeOut(elapsedRatio) * 50 + 5;
      const opacity = easeOut(1 - elapsedRatio);

      const style = new Style({
        image: new CircleStyle({
          radius: radius,
          stroke: new Stroke({
            color: "rgba(255, 0, 0, " + opacity + ")",
            width: 0.25 + opacity,
          }),
        }),
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(flashGeom);
      mapInstance.current.render();

      if (elapsed >= duration) {
        unByKey(listenerKey);
        flash(feature);
      }
    }
  };

  return (
    <div className="relative w-screen h-screen ">
      <div ref={mapRef} className="w-full h-full"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 gap-2">
        <FloatingButton>
          <FaGripHorizontal />
        </FloatingButton>
        <FloatingButton onClick={() => handleZoom(mapInstance, +2)}>
          <FaSearchPlus />
        </FloatingButton>
        <FloatingButton onClick={() => handleZoom(mapInstance, -2)}>
          <FaSearchMinus />
        </FloatingButton>
        <FloatingButton
          onClick={() =>
            addInteractions(
              vectorSourceRef.current,
              mapInstance.current,
              "Polygon"
            )
          }
        >
          <BiPolygon />
        </FloatingButton>
        <FloatingButton
          onClick={() =>
            addInteractions(
              vectorSourceRef.current,
              mapInstance.current,
              "LineString"
            )
          }
        >
          <PiLineSegmentFill />
        </FloatingButton>
        <FloatingButton
          onClick={() =>
            addInteractions(
              vectorSourceRef.current,
              mapInstance.current,
              "Point"
            )
          }
        >
          <HiOutlineLocationMarker />
        </FloatingButton>
      </div>
    </div>
  );
};

export default MapComponent;
