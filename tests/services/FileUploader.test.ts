import FileUploader from 'src/services/FileUploader';
import {
  describe,
  expect,
  it as baseIt,
  type Mock,
  vi,
  afterEach,
} from 'vitest';

const addEventListenerMock = vi.fn();
const reqOpenMock = vi.fn();
const reqSendMock = vi.fn();
const reqAbortMock = vi.fn();

const formDataAppendMock = vi.fn();

const it = baseIt.extend<{ XMLHttpRequestMock: Mock; formDataMock: Mock }>({
  XMLHttpRequestMock: async ({}, use: (mock: Mock) => Promise<void>) => {
    const mock = vi.fn();

    mock.mockImplementation(() => {
      return {
        upload: {
          addEventListener: addEventListenerMock,
        },
        open: reqOpenMock,
        send: reqSendMock,
        abort: reqAbortMock,
      };
    });

    vi.stubGlobal('XMLHttpRequest', mock);
    await use(mock);
    vi.unstubAllGlobals();
  },
  formDataMock: async ({}, use: (mock: Mock) => Promise<void>) => {
    const mock = vi.fn();

    mock.mockImplementation(() => ({ append: formDataAppendMock }));

    vi.stubGlobal('FormData', mock);
    await use(mock);
    vi.unstubAllGlobals();
  },
});

describe('FileUploader', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start upload file', ({ XMLHttpRequestMock, formDataMock }) => {
    const uploader = new FileUploader('txn-id');

    const files = [
      { file: new File(['test'], 'file.txt'), id: 'media1' },
      { file: new File(['test'], 'file2.txt'), id: 'media2' },
    ];

    uploader.start('url', files);

    expect(XMLHttpRequestMock).toBeCalledTimes(2);
    expect(formDataMock).toBeCalledTimes(2);

    expect(formDataAppendMock).toBeCalledTimes(6);
    expect(formDataAppendMock.mock.calls).toEqual([
      ['txnId', 'txn-id'],
      ['mediaId', 'media1'],
      ['file', files[0].file],
      ['txnId', 'txn-id'],
      ['mediaId', 'media2'],
      ['file', files[1].file],
    ]);

    expect(addEventListenerMock).toBeCalledTimes(4);
    expect(addEventListenerMock.mock.calls).toStrictEqual([
      ['progress', expect.any(Function)],
      ['abort', expect.any(Function)],
      ['progress', expect.any(Function)],
      ['abort', expect.any(Function)],
    ]);

    expect(reqOpenMock).toBeCalledTimes(2);
    expect(reqOpenMock).toBeCalledWith('POST', 'url');

    expect(reqSendMock).toBeCalledTimes(2);
    expect(reqSendMock).toBeCalledWith(formDataMock());
  });

  it('should update progress of media items', ({
    XMLHttpRequestMock,
    formDataMock,
  }) => {
    const uploader = new FileUploader('txn-id');

    const files = [
      { file: new File(['test'], 'file.txt'), id: 'media1' },
      { file: new File(['test'], 'file2.txt'), id: 'media2' },
    ];

    uploader.start('url', files);
    const mediaProgress1 = addEventListenerMock.mock.calls[0][1];
    const mediaProgress2 = addEventListenerMock.mock.calls[2][1];

    mediaProgress1({ loaded: 100, total: 1000 });

    expect(uploader.progresses).toEqual({ media1: 10, media2: 0 });

    mediaProgress2({ loaded: 100, total: 1000 });

    expect(uploader.progresses).toEqual({ media1: 10, media2: 10 });
  });

  it('should stop uploads', ({ XMLHttpRequestMock, formDataMock }) => {
    const uploader = new FileUploader('txn-id');

    const files = [
      { file: new File(['test'], 'file.txt'), id: 'media1' },
      { file: new File(['test'], 'file2.txt'), id: 'media2' },
    ];

    uploader.start('url', files);
    uploader.stop();

    expect(reqAbortMock).toBeCalledTimes(2);
  });

  it('should get upload finish status', ({
    XMLHttpRequestMock,
    formDataMock,
  }) => {
    const uploader = new FileUploader('txn-id');

    const files = [
      { file: new File(['test'], 'file.txt'), id: 'media1' },
      { file: new File(['test'], 'file2.txt'), id: 'media2' },
    ];

    uploader.start('url', files);

    vi.spyOn(uploader, 'progresses', 'get')
      .mockReturnValueOnce({
        media1: 20,
        media2: 100,
      })
      .mockReturnValueOnce({
        media1: 100,
        media2: 100,
      });

    expect(uploader.finished()).toBe(false);
    expect(uploader.finished()).toBe(true);
  });
});
