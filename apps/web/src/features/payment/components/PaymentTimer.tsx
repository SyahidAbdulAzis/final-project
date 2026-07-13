export function PaymentTimer({ timeRemaining }: { timeRemaining: number }) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours} jam ${minutes % 60} menit` : `${minutes} menit ${seconds % 60} detik`;
  };

  return (
    <div style={{
      marginTop: 12, padding: 12, borderRadius: 8,
      backgroundColor: timeRemaining <= 0 ? '#fee' : '#e3f2fd',
      border: `1px solid ${timeRemaining <= 0 ? '#c33' : '#2196f3'}`,
    }}>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: timeRemaining <= 0 ? '#c33' : '#1976d2', margin: 0 }}>
        {timeRemaining <= 0 ? 'Waktu habis! Silakan hubungi admin.' : `Sisa waktu: ${formatTime(timeRemaining)}`}
      </p>
    </div>
  );
}
