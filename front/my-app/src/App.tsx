import './resources/css/App.css';
import React from 'react';
import AppBarMenu from './components/AppBarMenu';
import { Outlet} from "react-router-dom";

const App: React.FC = () => {

  return (
    <>
      <AppBarMenu />
      <Outlet/>
    </>
  )
}

export default App;