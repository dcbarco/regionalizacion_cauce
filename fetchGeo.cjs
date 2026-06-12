async function fetchDev() {
  const https = require('https');
  const url = "https://raw.githubusercontent.com/cjimenezp/colombia-geojson/master/colombia-municipios.geojson";
  https.get(url, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
         console.log(body.substring(0, 500));
      });
  }).on('error', console.error);
}
fetchDev();


