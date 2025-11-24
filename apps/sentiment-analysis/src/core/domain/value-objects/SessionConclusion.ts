export interface RiskItem {
  id: string;
  level: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  recommendation: string;
  detectedAt: Date;
}

export interface OpportunityItem {
  id: string;
  description: string;
  potentialValue: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface ActionPlanItem {
  id: string;
  description: string;
  assignee?: string;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface TeamClimate {
  moral: number; // 0-100
  collaboration: number; // 0-100
  proactivity: number; // 0-100
  overall: number; // 0-100 (promedio)
}

export interface BusinessInsights {
  forAccountManager: string[];
  forTechnicalTeam: string[];
  forManagement: string[];
}

export interface SessionConclusion {
  id: string;
  analysisId: string;
  executiveSummary: string;
  overallScore: number; // 0-100

  risks: RiskItem[];
  opportunities: OpportunityItem[];

  actionPlan: {
    immediate: ActionPlanItem[]; // 24-48h
    shortTerm: ActionPlanItem[]; // 1 semana
    continuous: ActionPlanItem[]; // Seguimiento
  };

  insights: BusinessInsights;

  teamClimate: TeamClimate;

  satisfactionScore: number; // 0-100

  recommendations: string[];
  nextSteps: string[];

  createdAt: Date;
  updatedAt: Date;
}

export class SessionConclusionEntity implements SessionConclusion {
  constructor(
    public readonly id: string,
    public readonly analysisId: string,
    public readonly executiveSummary: string,
    public readonly overallScore: number,
    public readonly risks: RiskItem[],
    public readonly opportunities: OpportunityItem[],
    public readonly actionPlan: {
      immediate: ActionPlanItem[];
      shortTerm: ActionPlanItem[];
      continuous: ActionPlanItem[];
    },
    public readonly insights: BusinessInsights,
    public readonly teamClimate: TeamClimate,
    public readonly satisfactionScore: number,
    public readonly recommendations: string[],
    public readonly nextSteps: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('SessionConclusion ID cannot be empty');
    }

    if (!this.analysisId || this.analysisId.trim() === '') {
      throw new Error('Analysis ID cannot be empty');
    }

    if (!this.executiveSummary || this.executiveSummary.trim() === '') {
      throw new Error('Executive summary cannot be empty');
    }

    if (this.overallScore < 0 || this.overallScore > 100) {
      throw new Error('Overall score must be between 0 and 100');
    }

    if (this.satisfactionScore < 0 || this.satisfactionScore > 100) {
      throw new Error('Satisfaction score must be between 0 and 100');
    }

    if (
      this.teamClimate.moral < 0 ||
      this.teamClimate.moral > 100 ||
      this.teamClimate.collaboration < 0 ||
      this.teamClimate.collaboration > 100 ||
      this.teamClimate.proactivity < 0 ||
      this.teamClimate.proactivity > 100
    ) {
      throw new Error('Team climate scores must be between 0 and 100');
    }
  }

  public getHighPriorityRisks(): RiskItem[] {
    return this.risks.filter(r => r.level === 'high');
  }

  public getMediumPriorityRisks(): RiskItem[] {
    return this.risks.filter(r => r.level === 'medium');
  }

  public getLowPriorityRisks(): RiskItem[] {
    return this.risks.filter(r => r.level === 'low');
  }

  public getHighValueOpportunities(): OpportunityItem[] {
    return this.opportunities.filter(o => o.priority === 'high');
  }

  public getQuickWins(): OpportunityItem[] {
    return this.opportunities.filter(o => o.effort === 'low' && o.priority !== 'low');
  }

  public getImmediateActions(): ActionPlanItem[] {
    return this.actionPlan.immediate;
  }

  public getShortTermActions(): ActionPlanItem[] {
    return this.actionPlan.shortTerm;
  }

  public getContinuousActions(): ActionPlanItem[] {
    return this.actionPlan.continuous;
  }

  public getTotalActions(): number {
    return (
      this.actionPlan.immediate.length +
      this.actionPlan.shortTerm.length +
      this.actionPlan.continuous.length
    );
  }

  public getTeamClimateStatus(): 'excellent' | 'good' | 'fair' | 'poor' {
    const overall = this.teamClimate.overall;
    if (overall >= 85) return 'excellent';
    if (overall >= 70) return 'good';
    if (overall >= 50) return 'fair';
    return 'poor';
  }

  public getSatisfactionLevel(): 'very_satisfied' | 'satisfied' | 'neutral' | 'unsatisfied' {
    if (this.satisfactionScore >= 80) return 'very_satisfied';
    if (this.satisfactionScore >= 60) return 'satisfied';
    if (this.satisfactionScore >= 40) return 'neutral';
    return 'unsatisfied';
  }

  public getOverallStatus(): 'excellent' | 'good' | 'acceptable' | 'needs_attention' {
    if (this.overallScore >= 85) return 'excellent';
    if (this.overallScore >= 70) return 'good';
    if (this.overallScore >= 50) return 'acceptable';
    return 'needs_attention';
  }

  public hasHighRisks(): boolean {
    return this.risks.some(r => r.level === 'high');
  }

  public hasOpportunities(): boolean {
    return this.opportunities.length > 0;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      analysisId: this.analysisId,
      executiveSummary: this.executiveSummary,
      overallScore: this.overallScore,
      risks: this.risks.map(r => ({
        ...r,
        detectedAt: r.detectedAt.toISOString(),
      })),
      opportunities: this.opportunities,
      actionPlan: {
        immediate: this.actionPlan.immediate.map(a => ({
          ...a,
          deadline: a.deadline?.toISOString(),
        })),
        shortTerm: this.actionPlan.shortTerm.map(a => ({
          ...a,
          deadline: a.deadline?.toISOString(),
        })),
        continuous: this.actionPlan.continuous.map(a => ({
          ...a,
          deadline: a.deadline?.toISOString(),
        })),
      },
      insights: this.insights,
      teamClimate: this.teamClimate,
      satisfactionScore: this.satisfactionScore,
      recommendations: this.recommendations,
      nextSteps: this.nextSteps,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
