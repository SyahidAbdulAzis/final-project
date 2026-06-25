const fs = require("fs");
let c = fs.readFileSync("src/features/booking/pages/BookingHistoryPage.tsx","utf8");

c = c.replace(
  "import { getSuccessfulBookings } from '../services/bookingApi';",
  "import { getSuccessfulBookings } from '../services/bookingApi';
import { createReview, getReview } from '../services/reviewApi';",
);

c = c.replace(
  "import type { BookingResponse } from '../../../types/booking';",
  "import type { BookingResponse } from '../../../types/booking';
import type { ReviewResponse } from '../services/reviewApi';",
);

fs.writeFileSync("src/features/booking/pages/BookingHistoryPage.tsx", c);
console.log("Imports added");