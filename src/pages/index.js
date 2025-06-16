import Head from 'next/head';
import RoofImpactDashboard from '../components/RoofImpactDashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Agritectum Roof Calculator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Calculate roof CO₂, NOₓ and energy savings" />
      </Head>
      <RoofImpactDashboard />
    </>
  );
}
