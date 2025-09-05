import './App.css';
import Adminlogin from './Folkadminlogin';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Folkadmindash from './Folkadmindash';
function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Adminlogin />}></Route>
        <Route exact path='/Folkadmindash' element={<Folkadmindash/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
