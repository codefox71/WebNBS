// Entry module: import nbs.js from npm and initialize the app
import * as NBS from 'nbs.js';
window.NBS = NBS;
import { init } from './app.js';

// Initialize the application after attaching NBS to window
init();
