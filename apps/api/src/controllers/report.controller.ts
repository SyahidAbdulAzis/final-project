import { Request, Response } from 'express';
import {
  getSalesReportByProperty,
  getSalesReportByUser,
  getSalesReportByTransaction,
} from '../services/report.service.js';
import {
  getSalesChartData,
  getPropertyAvailabilityCalendar,
} from '../services/report-visual.service.js';

function pickParam(param: any) {
  if (!param) return null;
  return String(param);
}

function badRequest(res: Response, message: string) {
  return res.status(400).json({ error: message });
}

export async function getSalesReportByPropertyHandler(req: Request, res: Response) {
  const tenantId = pickParam(req.params.tenantId);
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
  const sortBy = (req.query.sortBy as 'date' | 'totalSales') || 'date';

  if (!tenantId) return badRequest(res, 'TenantId wajib diisi');
  try {
    const report = await getSalesReportByProperty(tenantId, startDate, endDate, sortBy);
    return res.json(report);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getSalesReportByUserHandler(req: Request, res: Response) {
  const tenantId = pickParam(req.params.tenantId);
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
  const sortBy = (req.query.sortBy as 'date' | 'totalSales') || 'date';

  if (!tenantId) return badRequest(res, 'TenantId wajib diisi');
  try {
    const report = await getSalesReportByUser(tenantId, startDate, endDate, sortBy);
    return res.json(report);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getSalesReportByTransactionHandler(req: Request, res: Response) {
  const tenantId = pickParam(req.params.tenantId);
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;
  const sortBy = (req.query.sortBy as 'date' | 'totalSales') || 'date';

  if (!tenantId) return badRequest(res, 'TenantId wajib diisi');
  try {
    const report = await getSalesReportByTransaction(tenantId, startDate, endDate, sortBy);
    return res.json(report);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getSalesChartDataHandler(req: Request, res: Response) {
  const tenantId = pickParam(req.params.tenantId);
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

  if (!tenantId) return badRequest(res, 'TenantId wajib diisi');
  try {
    const data = await getSalesChartData(tenantId, startDate, endDate);
    return res.json(data);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getPropertyAvailabilityCalendarHandler(req: Request, res: Response) {
  const tenantId = pickParam(req.params.tenantId);
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

  if (!tenantId) return badRequest(res, 'TenantId wajib diisi');
  if (!startDate || !endDate) return badRequest(res, 'StartDate dan EndDate wajib diisi');

  try {
    const report = await getPropertyAvailabilityCalendar(tenantId, startDate, endDate);
    return res.json(report);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
