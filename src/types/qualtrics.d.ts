
interface QualtricsWindow extends Window {
  Qualtrics?: {
    SurveyEngine: {
      getEmbeddedData: () => Record<string, string>;
      setEmbeddedData?: (name: string, value: string) => void;
    };
  };
}

declare const window: QualtricsWindow;
