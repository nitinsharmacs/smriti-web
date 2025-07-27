export interface CompleteStateProps {
  targetUploads: number;
  achievedUploads: number;
  previews: string[]; // thumbnails
  onComplete: () => void;
}
