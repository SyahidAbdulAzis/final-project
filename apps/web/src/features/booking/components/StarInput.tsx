export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer',
            color: star <= value ? '#f5a623' : '#ddd', transition: 'color 0.15s', padding: '0 2px',
          }}
          onMouseEnter={(e) => { if (star > value) (e.target as HTMLElement).style.color = '#f5a623'; }}
          onMouseLeave={(e) => { if (star > value) (e.target as HTMLElement).style.color = '#ddd'; }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
