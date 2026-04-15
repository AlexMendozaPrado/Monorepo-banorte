export enum ValidationLayer {
  SERVLET = 'SERVLET',
  THREEDS = 'THREEDS',
  CYBERSOURCE = 'CYBERSOURCE',
  AGREGADOR = 'AGREGADOR',
  EMV = 'EMV',
  AN5822 = 'AN5822',
}

export const VALIDATION_LAYER_DISPLAY: Record<ValidationLayer, string> = {
  [ValidationLayer.SERVLET]: 'Servlet',
  [ValidationLayer.THREEDS]: '3D Secure',
  [ValidationLayer.CYBERSOURCE]: 'Cybersource',
  [ValidationLayer.AGREGADOR]: 'Agregador',
  [ValidationLayer.EMV]: 'EMV',
  [ValidationLayer.AN5822]: 'AN5822 CIT/MIT',
};
