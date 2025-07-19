import MUIButton, { type ButtonProps } from '@mui/material/Button';

import './button.css';

const Button = ({ children, variant, style, onClick }: ButtonProps) => (
  <MUIButton
    variant={variant}
    className={variant === 'text' ? 'text-btn' : 'contained-btn'}
    onClick={onClick}
    style={style}
  >
    {children}
  </MUIButton>
);

export default Button;
