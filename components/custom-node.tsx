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
    if (data.isSelected) {
      return 'ring-2 ring-primary shadow-lg shadow-primary/50 scale-110 z-50';
    }
    if (data.isRelated) {
      return 'ring-1 ring-accent/50 opacity-100 z-40';
    }
    return 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0';
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
