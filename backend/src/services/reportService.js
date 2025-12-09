import Report from '../models/Report.js';
import Route from '../models/Route.js';

class ReportService {
  async createReport(reportData) {
    if (reportData.route) {
      const route = await Route.findById(reportData.route);
      if (!route) {
        throw new Error('Route not found');
      }
    }

    const report = await Report.create(reportData);
    return await report.populate('route');
  }

  async getReportById(reportId) {
    const report = await Report.findById(reportId).populate('route');
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  }

  async getAllReports(filters = {}) {
    const reports = await Report.find(filters).populate('route');
    return reports;
  }

  async getReportsByType(reportType) {
    const reports = await Report.find({ reportType }).populate('route');
    return reports;
  }

  async getReportsByRoute(routeId) {
    const reports = await Report.find({ route: routeId }).populate('route');
    return reports;
  }

  async getReportsByDateRange(fromDate, toDate) {
    const reports = await Report.find({
      fromDate: { $gte: fromDate },
      toDate: { $lte: toDate }
    }).populate('route');
    return reports;
  }

  async updateReport(reportId, updateData) {
    const report = await Report.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true, runValidators: true }
    ).populate('route');
    
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  }

  async deleteReport(reportId) {
    const report = await Report.findByIdAndDelete(reportId);
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  }

  async generateReport(reportId) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    return await report.generateReport();
  }

  async getFuelConsumptionReports() {
    return await Report.find({ 
      reportType: 'FuelConsumption' 
    }).populate('route');
  }

  async getMileageReports() {
    return await Report.find({ 
      reportType: 'Mileage' 
    }).populate('route');
  }

  async getPerformanceDriverReports() {
    return await Report.find({ 
      reportType: 'PerformanceDriver' 
    }).populate('route');
  }
}

export default new ReportService();
