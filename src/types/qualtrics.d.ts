
interface QualtricsWindow extends Window {
  Qualtrics?: {
    SurveyEngine: {
      getEmbeddedData: () => Record<string, string>;
      setEmbeddedData?: (name: string, value: string) => void;
    };
  };
}

declare global {
  interface Window {
    Qualtrics?: {
      SurveyEngine: {
        getEmbeddedData: () => Record<string, string>;
        setEmbeddedData?: (name: string, value: string) => void;
      };
    };
  }
}
