import './App.css';
import Layout from './components/Layout/Layout';
import Photos from './screens/Photos/Photos';

function App() {
  return (
    <div className='app'>
      <Layout>
        <Photos />
      </Layout>
    </div>
  );
}

export default App;
