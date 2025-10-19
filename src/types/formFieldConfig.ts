export type FormFieldConfigModel<T> = {
  type: string;
  size: number | { [key: string]: number };
  formKey: keyof T;
  label?: string;
  elements?: any[];
  text?: string;
  filesMax?: number;
  showTime?: boolean;
  autoFocus?: boolean;
};