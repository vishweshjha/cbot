import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Main from './pages/Main';
import Layout from './layout';
import 'font-awesome/css/font-awesome.min.css';
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
     <Main />
    </>
  );
}

export default App;
