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

export default handleZoom;
