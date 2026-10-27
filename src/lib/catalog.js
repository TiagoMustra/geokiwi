// Natural Earth draws these areas separately, but they should select their parent.
export function mapPoliticalFeature(feature) {
  const id = feature.properties?.name === 'Somaliland' ? '706'
    : feature.properties?.name === 'Baikonur' ? '398' : feature.id;
  return id === feature.id ? feature : { ...feature, id };
}
