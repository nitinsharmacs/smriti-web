import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createUploadTxn } from 'src/components/MediaUploader/UploadContext';
import Upload from 'src/components/Upload/Upload';
import userEvent from '@testing-library/user-event';

vi.mock('src/components/MediaUploader/UploadContext', () => ({
  createUploadTxn: vi.fn(),
}));

describe('UploadTest', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should open file explorer and send files to upload txn creator', async () => {
    const user = userEvent.setup();

    render(<Upload />);
    const file1 = new File(['hello'], 'hello.png', { type: 'image/png' });
    const file2 = new File(['hello'], 'hello2.png', { type: 'image/png' });
    const uploadInput = screen.getByLabelText<HTMLInputElement>('Upload media');
    const uploadBtn = screen.getByText('Upload');

    await userEvent.click(uploadBtn);
    await user.upload(uploadInput, [file1, file2]);

    expect(uploadInput.files).toHaveLength(2);
    expect(createUploadTxn).toHaveBeenCalledWith(uploadInput.files);
  });
});
