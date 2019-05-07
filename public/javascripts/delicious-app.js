import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';

// We need to make it run== On lui passe les id de Address, lng, lat 
autocomplete($('#address'), $('#lat'), $('#lng'));