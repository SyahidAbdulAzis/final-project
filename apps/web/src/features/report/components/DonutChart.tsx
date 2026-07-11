const COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
  '#84CC16', '#D946EF', '#0EA5E9', '#FB923C', '#34D399',
];

interface DonutChartItem {
  propertyName: string;
  totalSales: number;
  percentage: number;
}

interface DonutChartProps {
  data: DonutChartItem[];
  formatCurrency: (amount: number) => string;
}

export function DonutChart({ data, formatCurrency }: DonutChartProps) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 110;
  const innerRadius = 65;
  const strokeWidth = outerRadius - innerRadius;

  const total = data.reduce((sum, d) => sum + d.totalSales, 0);
  const circumference = 2 * Math.PI * ((outerRadius + innerRadius) / 2);

  if (data.length === 0 || total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={(outerRadius + innerRadius) / 2} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        </svg>
        <p style={{ marginTop: 16, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Belum ada data penjualan
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const percentage = (item.totalSales / total) * 100;
            const dashLength = (percentage / 100) * circumference;
            const offset =
              data
                .slice(0, index)
                .reduce((acc, d) => acc + (d.totalSales / total) * circumference, 0);
            return (
              <circle
                key={item.propertyName}
                cx={cx}
                cy={cy}
                r={(outerRadius + innerRadius) / 2}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>
            Total Penjualan
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, width: '100%', maxWidth: 500 }}>
        {data.map((item, index) => (
          <div
            key={item.propertyName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: COLORS[index % COLORS.length],
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
              {item.propertyName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {item.percentage}%
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', minWidth: 110, textAlign: 'right' }}>
              {formatCurrency(item.totalSales)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
