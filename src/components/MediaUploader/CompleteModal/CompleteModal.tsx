import Modal from 'src/components/MediaUploader/Modal/Modal';

import './completemodal.css';
import Button from 'src/components/Button/Button';

const CompleteModal = () => {
  return (
    <Modal>
      <div className='upload-complete-modal'>
        <div className='upload-complete-content'>
          <h4>Upload completed</h4>
          <div className='upload-summary'>
            4 of 4 files uploaded successfully. <br />
            Please click <b>Complete</b> to store permanently.
          </div>
          <div className='complete-controls'>
            <Button variant='contained'>Complete</Button>
          </div>
        </div>
        <div className='upload-preview'>
          <figure>
            <img
              src='https://fastly.picsum.photos/id/834/614/519.jpg?hmac=zvaiEABLMR3kZJgkZ9IN8OfB0-P10M_z3fH9hEcNS4k'
              alt='upload-preview'
            />
          </figure>
        </div>
      </div>
    </Modal>
  );
};

export default CompleteModal;
