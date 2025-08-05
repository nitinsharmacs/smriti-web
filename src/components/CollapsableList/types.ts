import type { ReactNode } from 'react';

export interface CollapsableListProps {
  open: boolean;
  children: ReactNode | ReactNode[];
}
