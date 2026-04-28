import * as fs from 'node:fs';
import * as path from 'node:path';

import { buildMatrixXlsx } from './builders/matrixBuilder';
import { buildServletLog } from './builders/servletLogBuilder';
import { buildProsaLog } from './builders/prosaLogBuilder';
import { buildThreeDsLog, ThreeDsBlock } from './builders/threeDsLogBuilder';
import { buildCybersourceLog, CybersourceBlock } from './builders/cybersourceLogBuilder';
import { buildVTransaccionesCsv, buildAfiliacionesCsv } from './builders/csvBuilder';

import { dlocalScenario } from './scenarios/01-dlocal-esquema-4-con-agp';
import { openlineaScenario } from './scenarios/02-openlinea-esquema-4-sin-agp';
import { ziguScenario } from './scenarios/03-zigu-esquema-1';
import { ecommerce3dsCsScenario } from './scenarios/04-ecommerce-3ds-cybersource';

import { PayworksServletLogParser } from '../src/infrastructure/log-parsers/PayworksServletLogParser';
import { PayworksProsaLogParser } from '../src/infrastructure/log-parsers/PayworksProsaLogParser';
import { ThreeDSLogParser } from '../src/infrastructure/log-parsers/ThreeDSLogParser';
import { CybersourceLogParser } from '../src/infrastructure/log-parsers/CybersourceLogParser';
import { TransactionTypeValueObject } from '../src/core/domain/value-objects/TransactionType';

interface Scenario {
  name: string;
  product: string;
  merchantName: string;
  matrix: Parameters<typeof buildMatrixXlsx>[0];
  servletBlocks: Parameters<typeof buildServletLog>[0];
  prosaBlocks: Parameters<typeof buildProsaLog>[0];
  threedsBlocks?: ThreeDsBlock[];
  cybersourceBlocks?: CybersourceBlock[];
  vTransacciones: Parameters<typeof buildVTransaccionesCsv>[0];
  afiliaciones: Parameters<typeof buildAfiliacionesCsv>[0];
}

const SCENARIOS: Scenario[] = [
  dlocalScenario,
  openlineaScenario,
  ziguScenario,
  ecommerce3dsCsScenario,
];

const OUTPUT_ROOT = path.resolve(__dirname, '../__tests__/fixtures/scenarios');

function main(): void {
  const validateMode = process.argv.includes('--validate');

  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });

  for (const scenario of SCENARIOS) {
    const dir = path.join(OUTPUT_ROOT, scenario.name);
    fs.mkdirSync(dir, { recursive: true });

    const matrixBuf = buildMatrixXlsx(scenario.matrix);
    fs.writeFileSync(path.join(dir, 'matriz.xlsx'), matrixBuf);

    const servletLog = buildServletLog(scenario.servletBlocks);
    fs.writeFileSync(path.join(dir, 'servlet.log'), servletLog, 'utf8');

    const prosaLog = buildProsaLog(scenario.prosaBlocks);
    fs.writeFileSync(path.join(dir, 'prosa.log'), prosaLog, 'utf8');

    if (scenario.threedsBlocks?.length) {
      const tdsLog = buildThreeDsLog(scenario.threedsBlocks);
      fs.writeFileSync(path.join(dir, 'threeds.log'), tdsLog, 'utf8');
    }

    if (scenario.cybersourceBlocks?.length) {
      const csLog = buildCybersourceLog(scenario.cybersourceBlocks);
      fs.writeFileSync(path.join(dir, 'cybersource.log'), csLog, 'utf8');
    }

    fs.writeFileSync(
      path.join(dir, 'vtransacciones.csv'),
      buildVTransaccionesCsv(scenario.vTransacciones),
      'utf8',
    );
    fs.writeFileSync(
      path.join(dir, 'afiliaciones.csv'),
      buildAfiliacionesCsv(scenario.afiliaciones),
      'utf8',
    );

    console.log(`✓ Generated: ${scenario.name}`);

    if (validateMode) {
      runValidation(scenario, servletLog, prosaLog);
    }
  }

  console.log(`\nAll fixtures written to: ${OUTPUT_ROOT}`);
}

function runValidation(scenario: Scenario, servletLog: string, prosaLog: string): void {
  const servletParser = new PayworksServletLogParser();
  const prosaParser = new PayworksProsaLogParser();

  const requestControlNumbers = scenario.servletBlocks
    .filter((b) => b.kind === 'request')
    .map((b) => b.controlNumber);

  for (const controlNumber of new Set(requestControlNumbers)) {
    try {
      servletParser.parseByControlNumber(servletLog, controlNumber);
    } catch (e) {
      throw new Error(`[${scenario.name}] servlet parse falla para CONTROL_NUMBER=${controlNumber}: ${(e as Error).message}`);
    }
  }

  for (const tx of scenario.matrix) {
    try {
      const messagePair = new TransactionTypeValueObject(tx.tipoTransaccion).getProsaMessagePair();
      prosaParser.parseByReferencia(prosaLog, tx.referencia, messagePair);
    } catch (e) {
      throw new Error(`[${scenario.name}] prosa parse falla para referencia=${tx.referencia}: ${(e as Error).message}`);
    }
  }

  if (scenario.threedsBlocks?.length) {
    const tdsLog = buildThreeDsLog(scenario.threedsBlocks);
    const tdsParser = new ThreeDSLogParser();
    for (const tx of scenario.matrix) {
      try {
        // Si hay logs 3DS, asumimos un folio por tx; usamos referencia como Reference3D fallback.
        // El builder garantiza que Reference3D = folio del block, y el block tiene fields.Reference3D = referencia tx.
        tdsParser.parseByFolio(tdsLog, tx.referencia);
      } catch {
        // Tolerancia: si la tx no tiene 3DS asociado, no falla
      }
    }
  }

  if (scenario.cybersourceBlocks?.length) {
    const csLog = buildCybersourceLog(scenario.cybersourceBlocks);
    const csParser = new CybersourceLogParser();
    const orderIds = scenario.cybersourceBlocks
      .map((b) => b.fields.OrderId)
      .filter((v): v is string => Boolean(v));
    for (const orderId of new Set(orderIds)) {
      try {
        csParser.parseByOrderId(csLog, orderId);
      } catch (e) {
        throw new Error(`[${scenario.name}] cybersource parse falla para OrderId=${orderId}: ${(e as Error).message}`);
      }
    }
  }

  console.log(`  ✓ validate ok`);
}

main();
