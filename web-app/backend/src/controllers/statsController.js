const supabase = require('../db/supabase');
const { successResponse, errorResponse } = require('../utils/formatResponse');

exports.getDashboardStats = async (req, res) => {
  if (!supabase) {
    return res.json(successResponse({
      total_signs: 2500,
      health_distribution: { High: 1800, Medium: 500, Low: 200 },
      last_scan_timestamp: new Date().toISOString(),
      chart_data: [
        { name: 'High', value: 1800 },
        { name: 'Medium', value: 500 },
        { name: 'Low', value: 200 }
      ]
    }));
  }

  try {
    const { count: total_signs } = await supabase.from('signs').select('*', { count: 'exact', head: true });
    
    res.json(successResponse({
      total_signs: total_signs,
      health_distribution: { High: 0, Medium: 0, Low: 0 },
      last_scan_timestamp: new Date().toISOString(),
      chart_data: []
    }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};
