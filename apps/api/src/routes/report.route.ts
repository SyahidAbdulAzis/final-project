import { Router } from 'express';
import {
  getSalesReportByPropertyHandler,
  getSalesReportByUserHandler,
  getSalesReportByTransactionHandler,
  getSalesChartDataHandler,
  getPropertyAvailabilityCalendarHandler,
} from '../controllers/report.controller.js';

const reportRouter = Router();

reportRouter.get('/reports/tenant/:tenantId/sales/property', getSalesReportByPropertyHandler);
reportRouter.get('/reports/tenant/:tenantId/sales/user', getSalesReportByUserHandler);
reportRouter.get('/reports/tenant/:tenantId/sales/transaction', getSalesReportByTransactionHandler);
reportRouter.get('/reports/tenant/:tenantId/sales/chart', getSalesChartDataHandler);
reportRouter.get('/reports/tenant/:tenantId/property-availability', getPropertyAvailabilityCalendarHandler);

export default reportRouter;
