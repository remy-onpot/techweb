import React from 'react';
import { Cpu, HardDrive, Monitor, Battery, Disc, Gamepad2, Tv } from 'lucide-react';
import { Product } from '@/lib/data';

export const ChameleonSpecs = ({ product }: { product: Product }) => {
  const specs = product.specs;

  // 1. LAPTOP RENDERER
  if (product.category === 'laptop') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <SpecItem icon={Cpu} label="Processor" value={specs.processor} />
        <SpecItem icon={HardDrive} label="RAM" value={specs.ram} />
        <SpecItem icon={HardDrive} label="Storage" value={specs.storage} />
        <SpecItem icon={Battery} label="Cycles" value={specs.cycles} />
      </div>
    );
  }

  // 2. TV RENDERER
  if (product.category === 'tv') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <SpecItem icon={Monitor} label="Display" value={specs.resolution} />
        <SpecItem icon={Tv} label="Size" value={specs.size} />
        <SpecItem icon={Cpu} label="Refresh Rate" value={specs.refreshRate} />
      </div>
    );
  }

  // 3. CONSOLE RENDERER
  if (product.category === 'console') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <SpecItem icon={Disc} label="Edition" value={specs.edition} />
        <SpecItem icon={Gamepad2} label="Controllers" value={`${specs.controllers} Included`} />
        <SpecItem icon={HardDrive} label="Storage" value={specs.storage} />
      </div>
    );
  }

  return <div>Specs available upon request</div>;
};

const SpecItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  </div>
);