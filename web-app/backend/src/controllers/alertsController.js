const supabase = require('../db/supabase');
const { successResponse, errorResponse } = require('../utils/formatResponse');

const MOCK_ALERTS = [
  { id: '1', sign_id: '1', highway: 'NH44', status: 'Low', flagged_at: new Date().toISOString() }
];

exports.getAllAlerts = async (req, res) => {
  if (!supabase) return res.json(successResponse(MOCK_ALERTS));

  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*, signs(highway_name, latitude, longitude)')
      .order('flagged_at', { ascending: false });
      
    if (error) throw error;
    res.json(successResponse(data));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

exports.getNewAlerts = async (req, res) => {
  if (!supabase) return res.json(successResponse(MOCK_ALERTS));

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data, error } = await supabase
      .from('alerts')
      .select('*, signs(highway_name, latitude, longitude)')
      .gte('flagged_at', yesterday.toISOString())
      .order('flagged_at', { ascending: false });
      
    if (error) throw error;
    res.json(successResponse(data));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};
