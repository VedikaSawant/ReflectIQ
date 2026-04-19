const supabase = require('../db/supabase');

exports.downloadReport = async (req, res) => {
  const { highway, from_date, to_date } = req.query;
  
  if (!supabase) {
    const csvContent = "Sign_ID,Highway,Chainage,Score,Label\n1,NH44,KM 100,85,High\n2,NH44,KM 102,45,Low\n";
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nhai_report.csv"');
    return res.send(csvContent);
  }

  try {
    let query = supabase.from('readings').select('*, signs(highway_name, chainage)');
    
    if (from_date) query = query.gte('timestamp', from_date);
    if (to_date) query = query.lte('timestamp', to_date);
    
    const { data, error } = await query;
    if (error) throw error;
    
    let csv = "ID,Sign_ID,Highway,Chainage,Score,Label,Timestamp\n";
    data.forEach(row => {
      csv += `${row.id},${row.sign_id},${row.signs?.highway_name},${row.signs?.chainage},${row.score},${row.label},${row.timestamp}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nhai_report.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
