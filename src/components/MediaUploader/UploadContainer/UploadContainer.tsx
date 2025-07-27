import type { UploadContainerProps } from './types';
import './styles.css';

const UploadContainer = ({ children }: UploadContainerProps) => {
  return <div className='upload-container'>{children}</div>;
};

export default UploadContainer;
