import Head from 'next/head';
import RoofImpactDashboard from '../components/RoofImpactDashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Agritectum Roof Calculator</title>
        <meta name="description" content="Calculate your roof's CO₂ impact and environmental benefit" />
      </Head>
      <main className="min-h-screen bg-gray-50 p-6">
        <RoofImpactDashboard />
      </main>
    </>
  );
}
