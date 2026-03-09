import { writeFileSync } from 'fs';

const env = `export const environment = {
  apiUrl: '${process.env.API_URL || ''}',
  googleMapsApiKey: '${process.env.GOOGLE_MAPS_KEY || ''}',
  googleClientId: '${process.env.GOOGLE_CLIENT_ID || ''}'
};
`;

writeFileSync('./src/environments/environment.production.ts', env);
console.log('✅ environment.production.ts generado');