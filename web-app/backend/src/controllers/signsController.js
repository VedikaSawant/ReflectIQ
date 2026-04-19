const supabase = require('../db/supabase');
const { successResponse, errorResponse, formatForMap } = require('../utils/formatResponse');

const MOCK_SIGNS = [
  { id: '1', highway_name: 'NH44', chainage: 'KM 100', latitude: 28.6139, longitude: 77.2090, latest_health_status: 'High', sign_type: 'Speed Limit' },
  { id: '2', highway_name: 'NH44', chainage: 'KM 102', latitude: 28.6150, longitude: 77.2100, latest_health_status: 'Low', sign_type: 'Stop Sign' }
];

exports.getAllSigns = async (req, res) => {
  const { highway, health, type } = req.query;
  
  if (!supabase) {
    // Return mock data for initial dev
    let filtered = [...MOCK_SIGNS];
    if (highway) filtered = filtered.filter(s => s.highway_name === highway);
    if (health) filtered = filtered.filter(s => s.latest_health_status === health);
    if (type) filtered = filtered.filter(s => s.sign_type === type);
    return res.json(successResponse(formatForMap(filtered)));
  }

  try {
    let query = supabase.from('signs').select(`
      *,
      readings (score, label, timestamp)
    `);
    
    if (highway) query = query.eq('highway_name', highway);
    if (type) query = query.eq('sign_type', type);
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json(successResponse(formatForMap(data)));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

exports.getSignById = async (req, res) => {
  const { id } = req.params;
  
  if (!supabase) {
    const sign = MOCK_SIGNS.find(s => s.id === id);
    if (!sign) return res.status(404).json(errorResponse('Sign not found'));
    return res.json(successResponse({
      ...sign,
      current_score: 85,
      irc_compliant: true,
      condition_label: 'Normal Wear',
      prediction: { days_to_failure: 120 },
      history: []
    }));
  }

  try {
    const { data, error } = await supabase
      .from('signs')
      .select('*, readings(*), predictions(*)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return res.status(404).json(errorResponse('Sign not found'));
    
    res.json(successResponse(data));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};
