async function run() {
  const res = await fetch('https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd2b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json');
  const body = await res.text();
  try {
    const data = JSON.parse(body);
    const caldas = data.features.find(f => f.properties.DPTO === '17');
    require('fs').writeFileSync('src/data/caldas.json', JSON.stringify({ type: "FeatureCollection", features: [caldas] }));
    console.log('Saved caldas.json');
  } catch(e) {
    console.error(body.substring(0, 100)); // see what it actually is
  }
}
run();
