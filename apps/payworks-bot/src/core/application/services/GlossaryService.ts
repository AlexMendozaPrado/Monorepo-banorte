import glossaryJson from '@/config/variable-glossary.json';
import { GlossaryData, GlossaryEntry, GlossarySection } from '@/core/domain/value-objects/VariableGlossary';

const DATA = glossaryJson as unknown as GlossaryData;

export class GlossaryService {
  getEntry(section: GlossarySection, manualName: string): GlossaryEntry | undefined {
    const block = DATA[section] as Record<string, GlossaryEntry> | undefined;
    return block?.[manualName];
  }

  getLogName(section: GlossarySection, manualName: string): string | null {
    return this.getEntry(section, manualName)?.logName ?? null;
  }

  getDisplayName(section: GlossarySection, manualName: string): string {
    return this.getEntry(section, manualName)?.displayName ?? manualName;
  }

  findByLogName(section: GlossarySection, logName: string): { manualName: string; entry: GlossaryEntry } | undefined {
    const block = DATA[section] as Record<string, GlossaryEntry> | undefined;
    if (!block) return undefined;
    for (const [manualName, entry] of Object.entries(block)) {
      if (manualName.startsWith('_')) continue;
      if (entry.logName === logName) return { manualName, entry };
    }
    return undefined;
  }

  listSection(section: GlossarySection): Record<string, GlossaryEntry> {
    const block = DATA[section] as Record<string, GlossaryEntry> | undefined;
    if (!block) return {};
    const clean: Record<string, GlossaryEntry> = {};
    for (const [k, v] of Object.entries(block)) {
      if (!k.startsWith('_')) clean[k] = v;
    }
    return clean;
  }

  getAmbiguousEntries(): Array<{ section: GlossarySection; manualName: string; entry: GlossaryEntry }> {
    const sections: GlossarySection[] = ['servlet', 'agregadores', 'an5822', 'threeds', 'cybersource', 'emv'];
    const out: Array<{ section: GlossarySection; manualName: string; entry: GlossaryEntry }> = [];
    for (const section of sections) {
      for (const [manualName, entry] of Object.entries(this.listSection(section))) {
        if (entry.ambiguous) out.push({ section, manualName, entry });
      }
    }
    return out;
  }

  getVersion(): string {
    return DATA._meta.version;
  }
}
