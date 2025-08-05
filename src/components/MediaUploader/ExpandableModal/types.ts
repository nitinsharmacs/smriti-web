import type { ReactNode } from 'react';

export interface ExpandableModalProps {
  children: ReactNode | ReactNode[];
  expandableContent: ReactNode[];
  actions: ReactNode[];
}
