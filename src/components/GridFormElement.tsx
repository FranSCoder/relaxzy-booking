import { handleInputChange, handleSelectChange } from '@/utils/create-booking-handlers';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

type GridFormElementProps<T> = {
  type: string;
  size: number | { [key: string]: number };
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  formKey: keyof T;
  elements?: any[];
  text?: string;
  label?: string;
  filesMax?: number;
  autoFocus?: boolean;
};

export function GridFormElement<T>({
  type,
  size,
  formData,
  setFormData,
  formKey,
  elements = [],
  text = '',
  label = '',
  filesMax = 1,
  autoFocus = false,
}: GridFormElementProps<T>) {
  function isRecordOfBooleans(value: unknown): value is Record<string, boolean> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.values(value).every((v) => typeof v === 'boolean')
    );
  }

  const componentToRender = () => {
    switch (type) {
      case 'radiogroup':
        return (
          <Grid size={size}>
            <FormControl sx={{ display: 'flex', flexDirection: 'row', gap: '8px' }} component="fieldset">
              {text ? (
                <Typography sx={{ color: '#6c6c6c' }} alignContent="center">
                  {text}
                </Typography>
              ) : (
                ''
              )}
              <RadioGroup
                row
                value={formData[formKey]}
                onChange={handleInputChange<T, typeof formKey>(formKey, setFormData)}
              >
                {elements.map((element) => (
                  <FormControlLabel key={element} value={element} control={<Radio />} label={element} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        );
      case 'select':
        return (
          <Grid size={size}>
            <FormControl size="small" fullWidth>
              <InputLabel id={`${type}-label`} sx={{ color: '#3d3d3d' }}>
                {label}
              </InputLabel>
              <Select
                labelId={`${type}-label`}
                id={`${type}-select`}
                label={label}
                value={typeof formData[formKey] === 'string' ? formData[formKey] : ''}
                onChange={handleSelectChange<T, typeof formKey>(formKey, setFormData)}
              >
                {elements.map((element) => (
                  <MenuItem key={element} value={element}>
                    {element}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        );
      case 'textfield':
        return (
          <Grid size={size}>
            <TextField
              sx={{ borderRadius: '5px' }}
              size="small"
              type="text"
              label={label}
              variant="outlined"
              value={formData[formKey]}
              onChange={handleInputChange<T, typeof formKey>(formKey, setFormData)}
              fullWidth
              autoFocus={true}
            />
          </Grid>
        );
      case 'datepicker':
        const value = formData[formKey];
        return (
          <Grid size={size}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label={label}
                value={value ? (value instanceof Date ? value : new Date(value as string)) : null}
                onChange={(newValue) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    [formKey]: newValue ? newValue : '',
                  }));
                }}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { borderRadius: '5px', width: '100%' },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
        );
      case 'checkbox':
        if (isRecordOfBooleans(formData[formKey])) {
          const nestedCheckboxes = formData[formKey] as { [key: string]: boolean };
          return (
            <Grid size={size}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{label ?? (text as string)}</Typography>
              <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: { xs: 0, xl: 1 } }}>
                {elements.map((element) => (
                  <FormControlLabel
                    key={element}
                    control={
                      <Checkbox
                        checked={nestedCheckboxes[element] || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [formKey]: {
                              ...(prev[formKey] as T[keyof T] as object),
                              [element]: e.target.checked,
                            } as T[keyof T],
                          }))
                        }
                      />
                    }
                    label={element}
                    sx={{
                      userSelect: 'none',
                      '& .MuiFormControlLabel-label': {
                        fontSize: { xs: '0.875rem', xl: '1rem' }, // label text responsive
                      },
                    }}
                  />
                ))}
              </FormGroup>
            </Grid>
          );
        } else {
          return (
            <Grid size={size}>
              <FormGroup>
                <FormControlLabel
                  key={formKey as string}
                  control={
                    <Checkbox
                      checked={(formData[formKey] as boolean) || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [formKey]: e.target.checked,
                        }))
                      }
                    />
                  }
                  label={label ?? (text as string)}
                  sx={{ userSelect: 'none' }}
                />
              </FormGroup>
            </Grid>
          );
        }
        default: ""
    }
  };

  return componentToRender();
}

export default GridFormElement