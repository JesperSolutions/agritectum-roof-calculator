import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ROOF_TYPES = {
  Bitumen: { co2: 0, nox: 0, energy: 0, lifespan: 25, maintenance: 'Inspect every 5–10 years.' },
  Photocat: { co2: 1.94, nox: 0.1, energy: 3.5, lifespan: 15, maintenance: 'Reapply every 2 years to maintain NOₓ effect.' },
  "White Coating": { co2: 4.5, nox: 0.017, energy: 6, lifespan: 15, maintenance: 'Clean every 2–3 years, recoat every 10–15 years.' },
  Triflex: { co2: 6.65, nox: 0.02, energy: 8.5, lifespan: 20, maintenance: 'Clean every 2 years, recoat every 15–20 years.' }
};

export default function RoofImpactDashboard() {
  const [roofSize, setRoofSize] = useState(1000);
  const [roofType, setRoofType] = useState("Photocat");
  const data = ROOF_TYPES[roofType];

  const co2PerYear = data.co2 * roofSize;
  const noxPerYear = data.nox * roofSize;
  const energyPerYear = data.energy * roofSize;
  const initialCo2 = 3.33 * roofSize;
  const neutralYear = data.co2 > 0 ? (initialCo2 / co2PerYear).toFixed(2) : 'Never';

  const graphData = Array.from({ length: 21 }, (_, year) => ({
    year,
    'CO₂ Saved (tonnes)': +(co2PerYear * year / 1000).toFixed(2),
    'NOₓ Saved (kg)': +(noxPerYear * year).toFixed(2),
    'Energy Saved (MWh)': +(energyPerYear * year / 1000).toFixed(2)
  }));

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setTextColor('#5C9323');
    doc.setFontSize(20);
    doc.text('Agritectum CO₂ Roof Impact Report', 20, 25);
    doc.setFontSize(12);
    doc.setTextColor('#000');
    doc.text(`Roof Type: ${roofType}`, 20, 40);
    doc.text(`Roof Size: ${roofSize.toLocaleString()} m²`, 20, 48);
    doc.text(`CO₂ Offset / year: ${co2PerYear.toLocaleString()} kg`, 20, 56);
    doc.text(`CO₂ Offset / 20 years: ${(co2PerYear * 20).toLocaleString()} kg`, 20, 64);
    doc.text(`Neutral after: ${neutralYear} years`, 20, 72);
    doc.text(`NOₓ Reduction / year: ${noxPerYear.toLocaleString()} kg`, 20, 80);
    doc.text(`Energy Savings / year: ${energyPerYear.toLocaleString()} kWh`, 20, 88);
    doc.text(`Expected Lifespan: ${data.lifespan} years`, 20, 96);
    doc.text(`Maintenance: ${data.maintenance}`, 20, 104, { maxWidth: 170 });

    doc.setTextColor('#1A3C40');
    doc.setFontSize(14);
    doc.text('Benefits of this Upgrade', 20, 120);
    doc.setFontSize(11);
    doc.setTextColor('#000');
    doc.text('- Reduced climate impact and CO₂ footprint', 25, 130);
    doc.text('- Cleaner urban air (NOₓ reduction)', 25, 138);
    doc.text('- Lower energy bills due to cooling savings', 25, 146);
    doc.text('- Compliant with green building standards', 25, 154);

    doc.setDrawColor(0);
    doc.setFillColor(92, 147, 35);
    doc.rect(20, 270, 170, 15, 'F');
    doc.setTextColor('#fff');
    doc.setFontSize(12);
    doc.text('Contact Agritectum — info@agritectum.com | +45 88 77 66 55', 25, 280);

    doc.save('Agritectum_Roof_Report.pdf');
  };

  return (
    <main className="min-h-screen bg-[#f6f9f4] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8 space-y-6 font-sans">
        <h1 className="text-3xl font-bold text-[#5C9323]">Roof CO₂ Impact Calculator</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Roof Size (m²)</label>
            <input
              type="number"
              value={roofSize}
              onChange={(e) => setRoofSize(Number(e.target.value))}
              className="input"
            />
          </div>
          <div>
            <label className="label">Roof Type</label>
            <select
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
              className="input"
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
            <p>{co2PerYear.toLocaleString()} kg ≈ {(co2PerYear / 1000).toFixed(2)} tonnes</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">CO₂ Offset / 20 years:</p>
            <p>{(co2PerYear * 20).toLocaleString()} kg ≈ {(co2PerYear * 20 / 1000).toFixed(2)} tonnes</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Neutral after:</p>
            <p>{neutralYear} years</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">NOₓ Reduction / year:</p>
            <p>{noxPerYear.toLocaleString()} kg</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Energy Savings / year:</p>
            <p>{energyPerYear.toLocaleString()} kWh ≈ {(energyPerYear / 1000).toFixed(2)} MWh</p>
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
          <h2 className="text-xl font-semibold text-[#1A3C40]">Performance Over Time</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={graphData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="CO₂ Saved (tonnes)" stroke="#1A3C40" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="NOₓ Saved (kg)" stroke="#6B7280" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Energy Saved (MWh)" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-10 bg-[#e8f3e8] p-6 rounded-xl text-[#1A3C40]">
          <h3 className="text-lg font-semibold mb-2">What does this mean for you?</h3>
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li>You reduce your building’s climate footprint significantly</li>
            <li>You help clean the surrounding air (NOₓ reduction)</li>
            <li>You lower energy costs by reducing cooling demand</li>
            <li>Your roof becomes part of your ESG and sustainability efforts</li>
          </ul>
        </div>

        <button
          onClick={exportPDF}
          className="mt-6 bg-[#5C9323] text-white px-6 py-2 rounded-lg hover:bg-[#4C8120]"
        >
          Export as PDF
        </button>
      </div>
    </main>
  );
}
