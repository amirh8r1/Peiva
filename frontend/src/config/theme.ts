import type { ThemeConfig } from 'antd';

/**
 * Ant Design theme configuration for the Jahad application.
 * Uses a professional green palette reflecting agricultural/farming context.
 */
export const antdTheme: ThemeConfig = {
  token: {
    fontFamily: 'Vazirmatn, Tahoma, sans-serif',
    borderRadius: 8,
    colorPrimary: '#389e0d',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#001529',
      bodyBg: '#f5f5f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#389e0d',
      darkItemHoverBg: '#0d3b05',
    },
    Table: {
      headerBg: '#fafafa',
    },
  },
};
