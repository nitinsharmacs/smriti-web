import type { ReactElement } from 'react';

import './modal.css';

interface ModalProps {
  children: ReactElement;
}

const Modal = ({ children }: ModalProps) => {
  return <div className='upload-txn-modal'>{children}</div>;
};

export default Modal;
