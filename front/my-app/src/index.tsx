import React from 'react';
import { createRoot } from "react-dom/client";
import './resources/css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Profile from './components/auth/Profile';
import Security from './components/auth/Security';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/Dashboard';
import WelcomePage from './components/WelcomePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css';
import messages_fr from "./resources/lang/fr.json";
import messages_en from "./resources/lang/en.json";
import { IntlProvider } from 'react-intl';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement as HTMLElement);

const messages: any = {
  'fr': messages_fr,
  'en': messages_en
}

const language = navigator.language.split(/[-_]/)[0];

const theme = createTheme();

root.render(
  <React.StrictMode>
    <IntlProvider locale={language} defaultLocale="en" messages={messages[language] || messages["en"]}>
      <ThemeProvider theme={theme}>
        <ReactNotifications />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="/" element={<WelcomePage />} />
              <Route path="signup" element={<Signup />} />
              <Route path="login" element={<Login />} />
              <Route path="resetPassword" element={<ResetPassword />} />
              <Route path="dashboard" element={<ProtectedRoute component={Dashboard} />} />
              <Route path="profile" element={<ProtectedRoute component={Profile} />} />
              <Route path="security" element={<ProtectedRoute component={Security} />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </IntlProvider>
  </React.StrictMode>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
