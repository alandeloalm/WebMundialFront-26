import { writeFileSync } from 'fs';

const prod = `export const environment = {
  apiUrl: '${process.env.API_URL || 'https://webmundialback-26.onrender.com/api'}',
  googleMapsApiKey: '${process.env.GOOGLE_MAPS_KEY || ''}',
  googleClientId: '${process.env.GOOGLE_CLIENT_ID || ''}'
};
`;

const dev = `export const environment = {
  apiUrl: 'http://localhost:3000/api',
  googleMapsApiKey: '${process.env.GOOGLE_MAPS_KEY || ''}',
  googleClientId: '${process.env.GOOGLE_CLIENT_ID || ''}'
};
`;

writeFileSync('./src/environments/environment.production.ts', prod);
writeFileSync('./src/environments/environment.ts', dev);
console.log('✅ Environments generados');