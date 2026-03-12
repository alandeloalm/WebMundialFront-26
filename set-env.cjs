const { writeFileSync, mkdirSync, existsSync } = require('fs');

const dir = './src/environments';
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const apiUrl = process.env.API_URL || 'https://webmundialback-26.onrender.com/api';
const mapsKey = process.env.GOOGLE_MAPS_KEY || '';
const clientId = process.env.GOOGLE_CLIENT_ID || '';

const prod = `export const environment = {
  apiUrl: '${apiUrl}',
  googleMapsApiKey: '${mapsKey}',
  googleClientId: '${clientId}'
};
`;

const dev = `export const environment = {
  apiUrl: 'http://localhost:3000/api',
  googleMapsApiKey: '${mapsKey}',
  googleClientId: '${clientId}'
};
`;

writeFileSync('./src/environments/environment.production.ts', prod);
writeFileSync('./src/environments/environment.ts', dev);
console.log('Environments generados');