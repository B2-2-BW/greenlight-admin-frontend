import { useState } from 'react';
import Funnel2 from '../component/dashboard-v2/Funnel2.jsx';
import PipeCard from '../component/dashboard-v2/PipeCard.jsx';
import Wave from '../component/dashboard-v2/Wave.jsx';

export default function DashboardV2Page() {
  const [emitInSignal, setEmitInSignal] = useState(null);
  const [emitOutSignal, setEmitOutSignal] = useState(null);
  const [waveOptions, setWaveOptions] = useState({
    height: 0,
  });
  const [water, setWater] = useState(0);

  const [inflowOptions, setInflowOptions] = useState({
    quantity: 0,
    duration: 0,
    delay: 0,
    size: { min: 4, max: 6 },
  });
  const [outflowOptions, setOutflowOptions] = useState({
    quantity: 0,
    duration: 0,
    delay: 0,
    size: { min: 4, max: 6 },
  });

  const simulate = () => {
    setInflowOptions({
      quantity: 1,
      duration: 1.5,
      delay: 0.1,
      size: { min: 4, max: 6 },
    });
    setOutflowOptions({
      quantity: 1,
      duration: 1.0,
      delay: 0.1,
      size: { min: 4, max: 6 },
    });
    setWaveOptions({
      height: Math.round(Math.random() * 100),
    });
    setEmitInSignal((v) => v + 1);
    setEmitOutSignal((v) => v + 1);
  };
  return (
    <>
      <PipeCard
        inflowEmitterComponent={
          <Funnel2
            className="absolute inset-0 z-20 block w-full h-full"
            emitSignal={emitInSignal}
            {...inflowOptions}
            straight={false}
            angle={10}
            speed={{ min: 2, max: 5 }}
            colors={['#3b82f6', '#60a5fa', '#93c5fd']}
            destroyYRatio={0.92}
            emitWidth={20}
            onDestroy={(count) => setWater((w) => w + count)}
          />
        }
        waveComponent={<Wave color="#3b82f6" {...waveOptions} amplitude={2} speed={0.03} />}
        outflowEmitterComponent={
          <Funnel2
            className="absolute inset-0 z-20 block w-full h-full"
            emitSignal={emitOutSignal}
            {...outflowOptions}
            straight={false}
            angle={10}
            speed={{ min: 2, max: 5 }}
            colors={['#3b82f6', '#60a5fa', '#93c5fd']}
            destroyYRatio={0.92}
            emitWidth={20}
            onDestroy={(count) => setWater((w) => w + count)}
          />
        }
      />
      <button onClick={() => simulate()}>simulate</button>
      <div>
        <div>Water: {water}</div>
        {/* Funnel 컴포넌트에 water 전달 */}
      </div>
    </>
  );
}
