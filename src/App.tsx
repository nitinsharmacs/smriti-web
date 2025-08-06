import Layout from 'src/components/Layout/Layout';
import './App.css';
import UploadProvider from 'src/components/MediaUploader/UploadContext';
import Photos from 'src/screens/Photos/Photos';

function App() {
  return (
    <div className='app'>
      <UploadProvider />
      <Layout>
        {/* <Photos /> */}
        <div>hi</div>
      </Layout>
    </div>
  );
}

export default App;
