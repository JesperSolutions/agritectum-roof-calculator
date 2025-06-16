import { useState } from 'react';

const ROOF_TYPES = {
  Bitumen: {
    co2: 0,
    nox: 0,
    energy: 0,
    lifespan: 25,
    maintenance: 'Inspect every 5–10 years.'
  },
  Photocat: {
    co2: 1.94,
    nox: 0.1,
    energy: 3.5,
    lifespan: 15,
    maintenance: 'Clean annually to maintain NOₓ effect.'
  },
  "White Coating": {
    co2: 4.5,
    nox: 0.017,
    energy: 6,
    lifespan: 15,
    maintenance: 'Clean every 2–3 years, recoat every 10–15 years.'
  },
  Triflex: {
    co2: 6.65,
    nox: 0.02,
    energy: 8.5,
    lifespan: 20,
    maintenance: 'Clean every 2 years, recoat every 15–20 years.'
  }
};

export default function RoofImpactCalculator() {
  const [roofSize, setRoofSize] = useState(1000);
  const [roofType, setRoofType] = useState("White Coating");

  const data = ROOF_TYPES[roofType];
  const co2OffsetYear = data.co2 * roofSize;
  const co2OffsetTotal = co2OffsetYear * 20;
  const neutralYear = data.co2 === 0 ? 'Never' : (3996 / co2OffsetYear).toFixed(2);
  const noxReduction = data.nox * roofSize;
  const energySavings = data.energy * roofSize;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Roof CO₂ Impact Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium text-gray-700">Roof Size (m²)</label>
          <input
            type="number"
            value={roofSize}
            onChange={(e) => setRoofSize(Number(e.target.value))}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Roof Type</label>
          <select
            value={roofType}
            onChange={(e) => setRoofType(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            {Object.keys(ROOF_TYPES).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="font-semibold">CO₂ Offset / year:</p>
          <p>{co2OffsetYear.toFixed(2)} kg</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="font-semibold">CO₂ Offset / 20 years:</p>
          <p>{co2OffsetTotal.toFixed(2)} kg</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="font-semibold">Neutral after:</p>
          <p>{neutralYear} years</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="font-semibold">NOₓ Reduction / year:</p>
          <p>{noxReduction.toFixed(2)} kg</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="font-semibold">Energy Savings / year:</p>
          <p>{energySavings.toFixed(2)} kWh</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100">
          <p className="font-semibold">Expected Lifespan:</p>
          <p>{data.lifespan} years</p>
        </div>
        <div className="md:col-span-2 p-4 rounded-lg bg-gray-100">
          <p className="font-semibold">Maintenance Recommendation:</p>
          <p>{data.maintenance}</p>
        </div>
      </div>
    </div>
  );
}
