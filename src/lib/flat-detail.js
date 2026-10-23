import { feature } from 'topojson-client';

let detailPromise;
/** Reuse the local high-detail file across questions and view switches. No map
 * API, tile provider, names or third-party requests are needed during play. */
export function loadDetailedWorld() {
  detailPromise ||= fetch('/maps/countries-10m.json').then(async response => {
    if (!response.ok) throw new Error('Detailed map unavailable');
    const topology = await response.json();
    if (!topology?.objects?.countries || !Array.isArray(topology.arcs)) throw new Error('Invalid map');
    return feature(topology, topology.objects.countries).features.map((country, index) => ({
      ...country, id: country.id ? String(country.id).padStart(3, '0') : `unmapped-detail-${index}`, key: `detail-${index}`,
    }));
  }).catch(error => { detailPromise = null; throw error; });
  return detailPromise;
}
