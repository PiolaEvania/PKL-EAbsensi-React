export const OFFICE_COORDINATES = {
  latitude: -3.3089332,
  longitude: 114.613662,
};

export const GEOFENCE_RADIUS_METERS = 100;

export const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null)
    return Infinity;
  const R = 6371e3;
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
