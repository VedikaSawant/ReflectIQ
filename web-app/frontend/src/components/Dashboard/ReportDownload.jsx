import React from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { downloadReport } from '../../services/api';

export default function ReportDownload() {
  return (
    <div className="report-options">
      <button className="report-btn" onClick={() => downloadReport('pdf')}>
        <FiFileText className="report-icon" />
        Export IRC Compliance PDF
      </button>
      <button className="report-btn" onClick={() => downloadReport('csv')}>
        <FiDownload className="report-icon" />
        Download Raw Data (CSV)
      </button>
    </div>
  );
}
