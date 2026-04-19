const successResponse = (data) => ({
  success: true,
  data: data
});

const errorResponse = (message) => ({
  success: false,
  error: message
});

const formatForMap = (signs) => {
  return signs.map(sign => ({
    id: sign.id,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [sign.longitude, sign.latitude] // GeoJSON is [lng, lat]
    },
    properties: {
      highway: sign.highway_name,
      chainage: sign.chainage,
      health: sign.latest_health_status,
      type: sign.sign_type
    }
  }));
};

module.exports = {
  successResponse,
  errorResponse,
  formatForMap
};
