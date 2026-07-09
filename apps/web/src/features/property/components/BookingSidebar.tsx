import { Dropdown } from '../../../components/common/Dropdown.js';
import type { Room } from '../utils/property-detail.helpers.js';

interface BookingSidebarProps {
  room: Room | undefined;
  checkIn: string;
  checkOut: string;
  today: string;
  currentPrice: number;
  nights: number;
  totalPrice: number;
  guestCount: number;
  tenant: { fullName: string; photoUrl?: string | null };
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestChange: (value: number) => void;
  onCheckout: () => void;
}

export function BookingSidebar({ room, checkIn, checkOut, today, currentPrice, nights, totalPrice, guestCount, tenant, onCheckInChange, onCheckOutChange, onGuestChange, onCheckout }: BookingSidebarProps) {
  return (
    <div className="pd-sidebar">
      <div className="pd-booking-card">
        <div className="pd-booking-price">
          <span className="pd-booking-price-amount">Rp {currentPrice.toLocaleString('id-ID')}</span>
          <span className="pd-booking-price-unit">/ malam</span>
        </div>
        {room && <div className="pd-booking-room-label">{room.name}</div>}
        <div className="pd-booking-inputs">
          <div className="pd-booking-date-row">
            <div className="pd-booking-date-cell pd-booking-date-cell--left">
              <label>CHECK-IN</label>
              <input type="date" min={today} value={checkIn} onChange={(e) => onCheckInChange(e.target.value)} />
            </div>
            <div className="pd-booking-date-divider" />
            <div className="pd-booking-date-cell pd-booking-date-cell--right">
              <label>CHECK-OUT</label>
              <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => onCheckOutChange(e.target.value)} />
            </div>
          </div>
          <div className="pd-booking-guest-row">
            <label>TAMU</label>
            <Dropdown value={String(guestCount)} options={Array.from({ length: room?.maxGuests || 8 }, (_, i) => i + 1).map((n) => ({ value: String(n), label: `${n} tamu` }))} onChange={(v) => onGuestChange(Number(v))} variant="compact" menuPosition="fixed" />
          </div>
        </div>
        <button type="button" className={`pd-booking-btn${(!checkIn || !checkOut || totalPrice === 0) ? ' pd-booking-btn--disabled' : ''}`} onClick={onCheckout} disabled={!checkIn || !checkOut || totalPrice === 0}>Pesan Sekarang</button>
        {(checkIn && checkOut) && (
          <div className="pd-booking-summary">
            <div className="pd-booking-row"><span>Rp {currentPrice.toLocaleString('id-ID')} × {nights} malam</span><span>Rp {(currentPrice * nights).toLocaleString('id-ID')}</span></div>
            <div className="pd-booking-row pd-booking-row--total"><span>Total</span><span>Rp {totalPrice.toLocaleString('id-ID')}</span></div>
          </div>
        )}
        <div className="pd-booking-host">
          <div className="pd-booking-host-avatar">
            {tenant.photoUrl ? <img src={tenant.photoUrl} alt={tenant.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : tenant.fullName.charAt(0).toUpperCase()}
          </div>
          <div><span className="pd-booking-host-label">Tuan Rumah</span><span className="pd-booking-host-name">{tenant.fullName}</span></div>
        </div>
      </div>
    </div>
  );
}
