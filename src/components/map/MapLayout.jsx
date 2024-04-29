/*
 * Copyright Intern MSIB6 @ PT Len Industri (Persero)
 *
 * THIS SOFTWARE SOURCE CODE AND ANY EXECUTABLE DERIVED THEREOF ARE PROPRIETARY
 * TO PT LEN INDUSTRI (PERSERO), AS APPLICABLE, AND SHALL NOT BE USED IN ANY WAY
 * OTHER THAN BEFOREHAND AGREED ON BY PT LEN INDUSTRI (PERSERO), NOR BE REPRODUCED
 * OR DISCLOSED TO THIRD PARTIES WITHOUT PRIOR WRITTEN AUTHORIZATION BY
 * PT LEN INDUSTRI (PERSERO), AS APPLICABLE.
 *
 * Created Date: Monday, March 29nd 2024, 09:07:45 am
 * Author: Febrina Qoonitah | febrina231@gmail.com <https://github.com/febrinaqh>
 *
 */

import { useEffect, useRef } from "react";
import { FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import { BiPolygon } from "react-icons/bi";
import { PiLineSegmentFill } from "react-icons/pi";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import { Modify } from "ol/interaction";

import { FloatingButton } from "../../commons/button/Button";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { iconStyle, modifyStyle } from "../../commons/style/MarkerStyle";
import handleZoom from "../zoom/zoom";
import flash from "../point/PointObject";
import { addInteractions, styleFunction } from "../draw/Draw";

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
      flash(e.feature, tileLayer, mapInstance);
    });

    return () => {
      map.setTarget(undefined);
    };
  });

  return (
    <div className="relative w-screen h-screen ">
      <div ref={mapRef} className="w-full h-full"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 gap-2">
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
