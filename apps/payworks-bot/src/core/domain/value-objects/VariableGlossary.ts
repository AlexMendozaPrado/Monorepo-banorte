export type GlossarySection = 'servlet' | 'agregadores' | 'an5822' | 'threeds' | 'cybersource' | 'emv';

export interface GlossaryEntry {
  logName: string | null;
  displayName: string;
  dataType: string;
  ambiguous: boolean;
  note?: string;
  validValues?: string[];
}

export type GlossaryData = {
  [K in GlossarySection]: Record<string, GlossaryEntry>;
} & {
  _meta: {
    version: string;
    builtFrom: string;
    note: string;
    pendingQuestions: string;
  };
};
