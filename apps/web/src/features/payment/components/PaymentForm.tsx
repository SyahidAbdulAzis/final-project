import { useRef } from 'react';

interface PaymentFormProps {
  previewUrl: string;
  submitting: boolean;
  uploading: boolean;
  timeRemaining: number;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PaymentForm({ previewUrl, submitting, uploading, timeRemaining, error, onFileChange, onSubmit }: PaymentFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const disabled = submitting || uploading || timeRemaining <= 0;

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Upload Bukti Transfer</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>
            File Bukti Transfer
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={onFileChange}
            required
            disabled={disabled}
            style={{
              width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--line)',
              fontSize: '0.95rem', backgroundColor: disabled ? '#f5f5f5' : '#fff',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>Format: JPG atau PNG, Maksimal: 1MB</p>
        </div>

        {previewUrl && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Preview</label>
            <img src={previewUrl} alt="Preview bukti transfer" style={{ width: '100%', maxWidth: 400, borderRadius: 8, border: '1px solid var(--line)' }} />
          </div>
        )}

        {error && (
          <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 16, fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={disabled} style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: disabled ? 'var(--muted)' : 'var(--primary)', color: '#fff',
          fontSize: '1rem', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        }}>
          {timeRemaining <= 0 ? 'Waktu Habis' : uploading ? 'Mengupload...' : submitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
        </button>
      </form>
    </div>
  );
}
