
interface QualtricsEmbeddedData {
  [key: string]: string;
}

interface QualtricsEngine {
  SurveyEngine: {
    getEmbeddedData(): Record<string, string>;
    setEmbeddedData(name: string, value: string): void;
  }
}

interface Window {
  Qualtrics?: QualtricsEngine;
}
