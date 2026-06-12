const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json'; // Maybe this one works
const fallback = 'https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd2b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json';

https.get(fallback, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const caldas = data.features.find(f => f.properties.DPTO === '17' || f.properties.NOMBRE_DPT === 'CALDAS');
      if (caldas) {
        fs.writeFileSync('src/data/caldas.json', JSON.stringify({ type: "FeatureCollection", features: [caldas] }));
        console.log('Saved caldas.json');
      } else {
        console.log('Caldas not found');
      }
    } catch(e) {
      console.error(e);
    }
  });
});
