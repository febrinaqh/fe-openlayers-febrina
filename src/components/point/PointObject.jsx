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

import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { easeOut } from "ol/easing.js";

/**
 * Creates a flashing effect on a feature.
 * @param {Feature} feature - The feature to flash.
 * @param {React.MutableRefObject<Map>} mapInstanceRef - Reference to the map instance.
 * @param {React.MutableRefObject<TileLayer>} tileLayerRef - Reference to the tile layer.
 */

const flash = (feature, mapInstanceRef, tileLayerRef) => {
  const duration = 3000;
  const start = Date.now();
  const flashGeom = feature.getGeometry().clone();
  const listenerKey = tileLayerRef.current.on("postrender", animate);

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
    mapInstanceRef.current.render();

    if (elapsed >= duration) {
      unByKey(listenerKey);
      flash(feature, mapInstanceRef, tileLayerRef);
    }
  }
};

export default flash;
