// Soporte cargado antes de cada spec. Importa los comandos custom y
// `cypress-file-upload` para soportar `cy.attachFile()` sobre inputs
// hidden (los del UploadCard).

import './commands';
import 'cypress-file-upload';
