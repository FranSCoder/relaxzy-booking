export type LayoutContextType = {
  buttonLabel: string;
  setButtonLabel: (label: string) => void;
  onButtonClick: (() => void) | null;
  setOnButtonClick: (fn: (() => void) | null) => void;
};