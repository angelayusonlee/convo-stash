
// Define the Qualtrics interface structure
interface QualtricsInterface {
  SurveyEngine: {
    getEmbeddedData: () => Record<string, string>;
    setEmbeddedData?: (name: string, value: string) => void;
  };
}

// Extend the Window interface to include Qualtrics
declare global {
  interface Window {
    Qualtrics?: QualtricsInterface;
  }
}

// This export is needed to make this a module
export {};
