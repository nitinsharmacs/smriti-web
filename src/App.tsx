import Layout from 'src/components/Layout/Layout';
import './App.css';
import UploadProvider from 'src/components/MediaUploader/UploadProvider';
import Photos from 'src/screens/Photos/Photos';

function App() {
  return (
    <div className='app'>
      <UploadProvider />
      <Layout>
        <Photos />
      </Layout>
    </div>
  );
}

export default App;
