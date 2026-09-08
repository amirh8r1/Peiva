import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp } from 'antd';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
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

// ThemeProvider: ConfigProvider با تم روشن/تیره + locale فا + RTL
// (holderRender پیام‌های استاتیک antd هم داخل ThemeProvider با تم سوییچ می‌شود)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AntdApp>
          <DataProvider>
            <AuthProvider>
              <HashRouter>
                <App />
              </HashRouter>
            </AuthProvider>
          </DataProvider>
        </AntdApp>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
