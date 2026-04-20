# RetroScan AI — Dashboard Walkthrough

## ✅ What Was Built

A **full-stack frontend dashboard** for the RetroScan AI retroreflectivity assessment system, located at `c:\Projects\ReflectIQ\Frontend\`.

Running at: **http://localhost:5173/**

---

## 📸 Screenshots

### 🗺️ Map View
![Map View](file:///C:/Users/VAISHNAVI/.gemini/antigravity/brain/a43bdec7-87b3-4bda-af1f-d5601dd02b0e/map_view_full_1776533580035.png)

### 🗺️ Map View — Detection Detail Popup
![Map with Detail Panel](file:///C:/Users/VAISHNAVI/.gemini/antigravity/brain/a43bdec7-87b3-4bda-af1f-d5601dd02b0e/map_view_selected_full_1776533634902.png)

### 📈 Analytics Tab
![Analytics](file:///C:/Users/VAISHNAVI/.gemini/antigravity/brain/a43bdec7-87b3-4bda-af1f-d5601dd02b0e/analytics_view_full_1776533589413.png)

### 🔍 Detections Table
![Detections](file:///C:/Users/VAISHNAVI/.gemini/antigravity/brain/a43bdec7-87b3-4bda-af1f-d5601dd02b0e/detections_view_full_1776533601483.png)

### 📋 Reports Tab
![Reports](file:///C:/Users/VAISHNAVI/.gemini/antigravity/brain/a43bdec7-87b3-4bda-af1f-d5601dd02b0e/reports_view_full_1776533608749.png)

---

## 🏗️ Architecture

```
Frontend/
├── src/
│   ├── data/
│   │   ├── mockDetections.js   ← 95 GPS-tagged detections (seeded random, NH-48 Pune)
│   │   └── constants.js        ← Colors, icons, display labels
│   ├── components/
│   │   ├── StatBar.jsx/css     ← 5-card KPI bar (km, critical, warning, compliant, avg RI)
│   │   ├── MapView.jsx/css     ← Leaflet map with Dark/Satellite/Street tiles
│   │   ├── AnalyticsPanel.jsx/css  ← Bar + Pie + Line charts (Recharts)
│   │   ├── DetectionsTable.jsx/css ← Paginated, searchable table
│   │   └── ExportPanel.jsx/css ← CSV download + PDF generation
│   ├── App.jsx                 ← Main layout: sidebar + topbar + content routing
│   ├── App.css                 ← Full dark-mode design system
│   └── main.jsx
```

---

## 🎯 Feature Checklist

| Feature | Status |
|---------|--------|
| Dark glassmorphism UI | ✅ |
| Collapsible sidebar nav | ✅ |
| 5-card KPI stat bar | ✅ |
| Leaflet map (Dark/Satellite/Street) | ✅ |
| 95 color-coded GPS markers (Red/Yellow/Green) | ✅ |
| Click marker → popup with RI details | ✅ |
| Click marker → slide-in detail panel | ✅ |
| Filter by Status / Label / Weather | ✅ |
| Bar chart: Avg RI vs IRC threshold | ✅ |
| Pie chart: Status distribution | ✅ |
| Line chart: RI trend along km corridor | ✅ |
| Paginated searchable detections table | ✅ |
| CSV export (all 95 detections) | ✅ |
| PDF report generation (jsPDF, top-10 critical) | ✅ |
| IRC threshold reference table | ✅ |
| "Live Survey Active" pulsing indicator | ✅ |

---

## 🚀 How to Run

```bash
cd c:\Projects\ReflectIQ\Frontend
npm run dev
# Open http://localhost:5173/
```

## 📦 Key Dependencies

| Library | Purpose |
|---------|---------|
| `react-leaflet` + `leaflet` | Interactive GPS map |
| `recharts` | Bar, Pie, Line charts |
| `jspdf` | PDF report generation |
| `lucide-react` | Icons |

