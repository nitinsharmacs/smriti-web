import type { SvgIconProps } from '@mui/material';

export type SelectBarControl = {
  icon?: React.ElementType<SvgIconProps>;
  handler: () => void;
};

export interface SelectBarProps {
  open: boolean;
  onClose: () => void;
  controls: SelectBarControl[];
  selections?: number;
}
