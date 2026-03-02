import { setOptions } from '@googlemaps/js-api-loader';
import { environment } from './environments/environments';

setOptions({
  key: environment.googleMapsApiKey
});