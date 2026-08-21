import { Button, theme as antdTheme } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useThemeMode } from '@/context/ThemeContext';
import { TOPBAR_H } from '@/config/layout';

/**
 * کلید سوییچ تم — با هر تغییر، آیکون با چرخش بین ماه و خورشید عوض می‌شود.
 * آیکون نمایش‌دهنده حالت فعلی است؛ خورشید در تم روشن (گرم)، ماه در تم تیره.
 */
export function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();
  const { token } = antdTheme.useToken();
  const isDark = mode === 'dark';

  return (
    <Button
      type="text"
      aria-label={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
      onClick={toggleTheme}
      style={{ width: TOPBAR_H, height: '100%', minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <span key={mode} className="theme-icon-in" style={{ display: 'inline-flex', fontSize: 16 }}>
        {isDark ? <MoonOutlined /> : <SunOutlined style={{ color: token.colorWarning }} />}
      </span>
    </Button>
  );
}
