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

import { useRef } from "react";
import { Draw } from "ol/interaction.js";
import { LineString, Point } from "ol/geom";
import { formatArea, formatLength } from "../../utils/format/formatMap";
import {
  modifyStyle,
  labelStyle,
  segmentStyle,
  style,
  tipStyle,
} from "../../commons/style/MarkerStyle";

const segmentStyles = [segmentStyle];

export function styleFunction(tipPointRef, modifyRef, feature, drawType, tip) {
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
      const segmentLabel = formatLength(segment);

      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }

      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(segmentLabel);
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

export function addInteractions(source, map, type) {
  const vectorRef = useRef(null);
  const tipPointRef = useRef(null);
  const modifyRef = useRef(null);

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
