import { Handle, Position } from 'reactflow';

interface CustomNodeData {
  label: string;
  type: string;
  color: string;
  isSelected?: boolean;
  isRelated?: boolean;
}

export default function CustomNode({ data }: { data: CustomNodeData }) {
  const getColorClasses = () => {
    if (data.isSelected) {
      return 'ring-2 ring-primary shadow-lg shadow-primary/50 scale-110';
    }
    if (data.isRelated) {
      return 'ring-1 ring-accent/50 opacity-100';
    }
    return 'opacity-40 hover:opacity-100';
  };

  return (
    <div
      className={`px-4 py-2 rounded-lg font-medium text-sm text-white ${data.color} transition-all duration-200 cursor-pointer ${getColorClasses()}`}
    >
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
