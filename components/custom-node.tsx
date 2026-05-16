import { Handle, Position } from 'reactflow';

interface CustomNodeData {
  label: string;
  type: string;
  path?: string;
  showPath?: boolean;
  color: string;
  isSelected?: boolean;
  isRelated?: boolean;
}

export default function CustomNode({ data }: { data: CustomNodeData }) {
  const getColorClasses = () => {
    const isAnySelected = (data as any).isAnySelected;
    
    if (data.isSelected) {
      return 'ring-2 ring-primary shadow-lg shadow-primary/50 scale-110 z-50 grayscale-0 opacity-100';
    }
    if (data.isRelated) {
      return 'ring-1 ring-accent/50 opacity-100 z-40 grayscale-0';
    }
    
    // Default state when nothing is selected
    if (!isAnySelected) {
      return 'opacity-100 grayscale-0 shadow-md hover:scale-105';
    }

    // Dimmed state when something else is selected
    return 'opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all';
  };

  return (
    <div
      className={`px-3 py-2 rounded-lg font-medium text-white ${data.color} transition-all duration-300 cursor-pointer min-w-[140px] flex flex-col gap-0.5 border border-white/10 ${getColorClasses()}`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-white/40 border-none" />
      <span className="text-sm tracking-tight">{data.label}</span>
      {data.path && data.showPath !== false && (
        <span className="text-[9px] opacity-60 font-mono truncate max-w-[120px]">
          {data.path}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-white/40 border-none" />
    </div>
  );
}
