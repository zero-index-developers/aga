import { Node } from 'reactflow';

export interface CustomNodeData {
  label: string;
  type: string;
  group?: string;
  path?: string;
  showPath?: boolean;
  color?: string;
  isSelected?: boolean;
  isRelated?: boolean;
  isAnySelected?: boolean;
  risk?: string;
  impact?: number;
  isFolder?: boolean;
  expanded?: boolean;
}

export type CustomNode = Node<CustomNodeData>;
