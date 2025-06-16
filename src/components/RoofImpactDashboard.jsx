import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ROOF_TYPES = {
  Bitumen: { co2: 0, nox: 0, energy: 0, lifespan: 25, maintenance: 'Inspect every 5–10 years.' },
  Photocat: { co2: 1.94, nox: 0.1, energy: 3.5, lifespan: 15, maintenance: 'Clean annually to maintain NOₓ effect.' },
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

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8 space-y-6 font-sans">
        <h1 className="text-3xl font-bold text-[#1A3C40]">Roof CO₂ Impact Calculator</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Roof Size (m²)
              <div className="text-xs text-gray-500">How many square meters is your flat roof?</div>
            </label>
            <input
              type="number"
              value={roofSize}
              onChange={(e) => setRoofSize(Number(e.target.value))}
              className="input"
            />
          </div>
          <div>
            <label className="label">Roof Type
              <div className="text-xs text-gray-500">Choose your upgrade option (bitumen is the base roof).</div>
            </label>
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
            <p className="font-semibold">CO₂ Offset / year</p>
            <p>{co2PerYear.toLocaleString()} kg ≈ {(co2PerYear / 1000).toFixed(2)} tonnes</p>
            <p className="text-xs text-gray-500">CO₂ offset through reflection, air quality, or vegetation.</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">CO₂ Offset / 20 years</p>
            <p>{(co2PerYear * 20).toLocaleString()} kg ≈ {(co2PerYear * 20 / 1000).toFixed(2)} tonnes</p>
            <p className="text-xs text-gray-500">Long-term climate benefit of your upgrade.</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Neutral after</p>
            <p>{neutralYear} years</p>
            <p className="text-xs text-gray-500">When the upgrade pays off its CO₂ footprint.</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">NOₓ Reduction / year</p>
            <p>{noxPerYear.toLocaleString()} kg</p>
            <p className="text-xs text-gray-500">Air pollutant neutralized from local atmosphere.</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Energy Savings / year</p>
            <p>{energyPerYear.toLocaleString()} kWh ≈ {(energyPerYear / 1000).toFixed(2)} MWh</p>
            <p className="text-xs text-gray-500">Reduced cooling demand on warm days.</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Expected Lifespan</p>
            <p>{data.lifespan} years</p>
          </div>
          <div className="md:col-span-2 p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold">Maintenance Recommendation</p>
            <p>{data.maintenance}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Performance Over Time</h2>
          <p className="text-sm text-gray-500">Track how your CO₂, NOₓ, and energy savings grow annually.</p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={graphData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Impact', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="CO₂ Saved (tonnes)" stroke="#1A3C40" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="NOₓ Saved (kg)" stroke="#6B7280" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Energy Saved (MWh)" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-10 bg-[#E7F5F1] p-6 rounded-xl text-[#1A3C40]">
          <h3 className="text-lg font-semibold mb-2">What does this mean for you?</h3>
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li>You reduce your building’s climate footprint significantly</li>
            <li>You help clean the surrounding air (NOₓ reduction)</li>
            <li>You lower energy costs by reducing cooling demand</li>
            <li>Your roof becomes part of your ESG and sustainability efforts</li>
          </ul>
        </div>
      </div>
    </main>
  );
}