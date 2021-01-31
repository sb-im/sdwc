/**
 * @param {SDWC.ParsedWaypoint} waypoint
 * @returns {{ boundary: SDWC.LatLng[], polylines: SDWC.MapPolyline[], markers: SDWC.MarkerAction[] }}
 */
export function waypointsToMapProps(waypoint) {
  return {
    boundary: waypoint.boundary || [],
    polylines: [{
      name: 'path',
      style: { stroke: 'solid', color: '#ea4335' },
      coordinates: waypoint.path
    }],
    markers: waypoint.actions
  };
}
