import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CircularProgressBar from 'src/components/CircularProgress/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorIcon from '@mui/icons-material/Error';

import { type MediaItemProps } from 'src/components/MediaUploader/MediaItem/types';
import { MediaType, MediaUploadStatus } from '../types';
import './mediaitem.css';
import { IconButton } from '@mui/material';
import { doNothing } from 'src/helpers';

const MediaStatus = (
  status: MediaUploadStatus,
  progress: number = 0,
  onRetry: () => void = doNothing
) => {
  switch (status) {
    case MediaUploadStatus.InProgress:
      return <CircularProgressBar value={progress} size={20} thickness={8} />;
    case MediaUploadStatus.Success:
      return <CheckCircleIcon />;
    case MediaUploadStatus.Failed:
      return (
        <IconButton onClick={onRetry}>
          <ReplayIcon />
        </IconButton>
      );
    default:
      return <ErrorIcon />;
  }
};

const MediaItem = (props: MediaItemProps) => {
  return (
    <div className='upload-media-item'>
      <div className='media-icon'>
        {props.type === MediaType.Video ? (
          <VideocamOutlinedIcon />
        ) : (
          <InsertPhotoOutlinedIcon />
        )}
      </div>
      <div className='media-name'>{props.name}</div>
      <div className='media-status'>
        {MediaStatus(props.status, props.progress)}
      </div>
    </div>
  );
};

export default MediaItem;
