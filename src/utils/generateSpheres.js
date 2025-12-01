import * as turf from '@turf/turf';

export function generateSpheres(center, count = 6, radiusInKm = 0.5) {
  // center is [lat, lng]
  // turf expects [lng, lat]
  if (!center) return [];
  
  const centerPoint = turf.point([center[1], center[0]]);
  
  const spheres = [];
  for (let i = 0; i < count; i++) {
    // Random bearing and distance
    const distance = Math.random() * radiusInKm;
    const bearing = Math.random() * 360 - 180;
    const destination = turf.destination(centerPoint, distance, bearing, { units: 'kilometers' });
    spheres.push({
      id: i,
      lat: destination.geometry.coordinates[1],
      lng: destination.geometry.coordinates[0],
      found: false,
      letter: '?', // Placeholder, will be assigned later
    });
  }
  return spheres;
}
