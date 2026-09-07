import { useState } from 'react';
import { Button, Input, Space, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { pivaType } from '@/config/theme';

const { TextArea } = Input;

interface FeedbackActionsProps {
  /** رد فقط برای گام‌هایی که رد تعریف شده (supply/driver) — pickup فقط تأیید دارد. */
  allowReject?: boolean;
  confirmLabel?: string;
  onConfirm: () => void;
  onReject: (note: string) => void;
}

/** اقدامات پاسخ‌دهنده: تأیید + (اختیاری) رد با یادداشت — مشترک بین گام‌های supply/driver/pickup. */
export function FeedbackActions({ allowReject = false, confirmLabel = 'تأیید', onConfirm, onReject }: FeedbackActionsProps) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');

  const handleReject = () => {
    if (!note.trim()) return;
    onReject(note.trim());
    setRejecting(false);
    setNote('');
  };

  return (
    <Space direction="vertical" style={{ width: '100%', marginTop: 12 }} size={8}>
      {rejecting && (
        <>
          <TextArea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="دلیل رد را بنویسید..."
          />
          <Space>
            <Button danger size="small" icon={<CloseOutlined />} disabled={!note.trim()} onClick={handleReject}>
              ثبت رد
            </Button>
            <Button size="small" onClick={() => { setRejecting(false); setNote(''); }}>
              انصراف
            </Button>
          </Space>
        </>
      )}
      <Space>
        <Button type="primary" size="large" icon={<CheckOutlined />} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        {allowReject && !rejecting && (
          <Button danger size="large" icon={<CloseOutlined />} onClick={() => setRejecting(true)}>
            رد
          </Button>
        )}
      </Space>
      {allowReject && !rejecting && (
        <Typography.Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>
          در صورت مغایرت، می‌توانید با ذکر دلیل رد کنید.
        </Typography.Text>
      )}
    </Space>
  );
}
