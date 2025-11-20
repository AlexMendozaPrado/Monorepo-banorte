export interface EmotionScore {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
}

export class EmotionScoreValueObject implements EmotionScore {
  constructor(
    public readonly joy: number,
    public readonly sadness: number,
    public readonly anger: number,
    public readonly fear: number,
    public readonly surprise: number,
    public readonly disgust: number
  ) {
    this.validateScores();
  }

  private validateScores(): void {
    const emotions = [this.joy, this.sadness, this.anger, this.fear, this.surprise, this.disgust];
    
    emotions.forEach((score, index) => {
      if (score < 0 || score > 1) {
        const emotionNames = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'];
        throw new Error(`${emotionNames[index]} score must be between 0 and 1`);
      }
    });

    // Validate that scores sum to approximately 1 (allowing for small floating point errors)
    const sum = emotions.reduce((acc, score) => acc + score, 0);
    if (Math.abs(sum - 1) > 0.01) {
      throw new Error('Emotion scores must sum to approximately 1');
    }
  }

  public getDominantEmotion(): keyof EmotionScore {
    const emotions: Array<[keyof EmotionScore, number]> = [
      ['joy', this.joy],
      ['sadness', this.sadness],
      ['anger', this.anger],
      ['fear', this.fear],
      ['surprise', this.surprise],
      ['disgust', this.disgust],
    ];

    return emotions.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )[0];
  }

  public getEmotionIntensity(): 'low' | 'medium' | 'high' {
    const maxScore = Math.max(this.joy, this.sadness, this.anger, this.fear, this.surprise, this.disgust);
    
    if (maxScore < 0.4) return 'low';
    if (maxScore < 0.7) return 'medium';
    return 'high';
  }

  public isNeutral(): boolean {
    const threshold = 0.3;
    return Math.max(this.joy, this.sadness, this.anger, this.fear, this.surprise, this.disgust) < threshold;
  }

  public toArray(): number[] {
    return [this.joy, this.sadness, this.anger, this.fear, this.surprise, this.disgust];
  }

  public toJSON(): Record<string, number> {
    return {
      joy: this.joy,
      sadness: this.sadness,
      anger: this.anger,
      fear: this.fear,
      surprise: this.surprise,
      disgust: this.disgust,
    };
  }

  public static fromJSON(data: Record<string, number>): EmotionScoreValueObject {
    return new EmotionScoreValueObject(
      data.joy || 0,
      data.sadness || 0,
      data.anger || 0,
      data.fear || 0,
      data.surprise || 0,
      data.disgust || 0
    );
  }
}
