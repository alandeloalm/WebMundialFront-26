import { setOptions } from '@googlemaps/js-api-loader';
import { environment } from './environments/environment';

setOptions({
  key: environment.googleMapsApiKey
});