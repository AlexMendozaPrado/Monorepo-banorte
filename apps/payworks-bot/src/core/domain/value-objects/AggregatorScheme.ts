export enum AggregatorScheme {
  ESQ_1_TASA_NATURAL = 'ESQ_1',
  ESQ_4_SIN_AGP = 'ESQ_4_SIN_AGP',
  ESQ_4_CON_AGP = 'ESQ_4_CON_AGP',
}

export const AGGREGATOR_SCHEME_DISPLAY: Record<AggregatorScheme, string> = {
  [AggregatorScheme.ESQ_1_TASA_NATURAL]: 'Esquema 1 - Tasa Natural',
  [AggregatorScheme.ESQ_4_SIN_AGP]: 'Esquema 4 - Sin AGP',
  [AggregatorScheme.ESQ_4_CON_AGP]: 'Esquema 4 - Con AGP',
};
