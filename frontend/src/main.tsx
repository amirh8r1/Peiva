import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import { antdTheme } from './config/theme';
import App from './App';
import { DataProvider } from './context/DataContext';
import './utils/dayjs'; // must be before any antd DatePicker usage
import './config/rtl';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={antdTheme}
        locale={faIR}
        direction="rtl"
      >
        <DataProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </DataProvider>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
