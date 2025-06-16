import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ROOF_TYPES = {
  Bitumen: { co2: 0, nox: 0, energy: 0, lifespan: 25, maintenance: 'Inspect every 5–10 years.' },
  Photocat: { co2: 1.94, nox: 0.1, energy: 3.5, lifespan: 15, maintenance: 'Clean annually to maintain NOₓ effect.' },
  "White Coating": { co2: 4.5, nox: 0.017, energy: 6, lifespan: 15, maintenance: 'Clean every 2–3 years, recoat every 10–15 years.' },
  Triflex: { co2: 6.65, nox: 0.02, energy: 8.5, lifespan: 20, maintenance: 'Clean every 2 years, recoat every 15–20 years.' }
};

export default function RoofImpactDashboard() {
  const [roofSize, setRoofSize] = useState(1000);
  const [roofType, setRoofType] = useState("Bitumen");

  const data = ROOF_TYPES[roofType];
  const co2PerYear = data.co2 * roofSize;
  const noxPerYear = data.nox * roofSize;
  const energyPerYear = data.energy * roofSize;
  const initialCo2 = 3.33 * roofSize;
  const neutralYear = data.co2 > 0 ? (initialCo2 / co2PerYear).toFixed(2) : 'Never';

  const graphData = Array.from({ length: 21 }, (_, year) => ({
    year,
    co2Saved: co2PerYear * year,
    noxSaved: noxPerYear * year,
    energySaved: energyPerYear * year,
  }));

  const exportPDF = () => {
    const input = document.getElementById('report');
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save('roof-impact-report.pdf');
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8 space-y-6 font-sans" id="report">
        <h1 className="text-3xl font-bold text-[#1A3C40]">Roof CO₂ Impact Calculator</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-700">Roof Size (m²)</label>
            <input
              type="number"
              value={roofSize}
              onChange={(e) => setRoofSize(Number(e.target.value))}
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-[#1A3C40] focus:border-[#1A3C40]"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Roof Type</label>
            <select
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-[#1A3C40] focus:border-[#1A3C40]"
            >
              {Object.keys(ROOF_TYPES).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">CO₂ Offset / year:</p>
            <p>{co2PerYear.toFixed(2)} kg</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">CO₂ Offset / 20 years:</p>
            <p>{(co2PerYear * 20).toFixed(2)} kg</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Neutral after:</p>
            <p>{neutralYear} years</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">NOₓ Reduction / year:</p>
            <p>{noxPerYear.toFixed(2)} kg</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Energy Savings / year:</p>
            <p>{energyPerYear.toFixed(2)} kWh</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Expected Lifespan:</p>
            <p>{data.lifespan} years</p>
          </div>
          <div className="md:col-span-2 p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Maintenance Recommendation:</p>
            <p>{data.maintenance}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Performance Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="co2Saved" stroke="#1A3C40" name="CO₂ Saved (kg)" />
              <Line type="monotone" dataKey="noxSaved" stroke="#6B7280" name="NOₓ Saved (kg)" />
              <Line type="monotone" dataKey="energySaved" stroke="#3B82F6" name="Energy Saved (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button
          onClick={exportPDF}
          className="mt-6 bg-[#1A3C40] text-white px-6 py-2 rounded-lg hover:bg-[#174144]"
        >
          Export as PDF
        </button>
      </div>
    </main>
  );
}
