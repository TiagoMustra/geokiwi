import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AccountProvider, { useAccount } from './auth/AccountProvider.jsx';
import { LocaleProvider } from './i18n/LocaleContext.jsx';
import './styles.css';
import './themes.css';
import './progress.css';
import './kiwi.css';
import './play.css';
import './islands.css';
import './game-cards.css';

function AccountApp(){const {user,dataEpoch}=useAccount();return <App key={`${user?.id||'guest'}:${dataEpoch}`}/>;}
createRoot(document.getElementById('root')).render(<React.StrictMode><LocaleProvider><AccountProvider><AccountApp /></AccountProvider></LocaleProvider></React.StrictMode>);
