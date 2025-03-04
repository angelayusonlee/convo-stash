
interface QualtricsEmbeddedData {
  [key: string]: string;
}

interface QualtricsEngine {
  SurveyEngine: {
    getEmbeddedData(): Record<string, string>;
  }
}

interface Window {
  Qualtrics?: QualtricsEngine;
}
