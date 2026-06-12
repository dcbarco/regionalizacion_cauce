async function run() {
  const query = `
    [out:json];
    relation["name"="Caldas"]["admin_level"="4"];
    out geom;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  });
  const data = await res.json();
  // process the OSM objects to geojson loosely or just save
  require('fs').writeFileSync('caldas_osm.json', JSON.stringify(data));
  console.log('Saved');
}
run();
