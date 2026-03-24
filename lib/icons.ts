import {
  Settings,
  Layers,
  Database,
  FileText,
  Brain,
  Network,
  Code2,
  GitBranch,
  Cpu,
  MessageSquare,
  Blocks,
  Search,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  settings: Settings,
  layers: Layers,
  database: Database,
  "file-text": FileText,
  brain: Brain,
  network: Network,
  code: Code2,
  "git-branch": GitBranch,
  cpu: Cpu,
  "message-square": MessageSquare,
  blocks: Blocks,
  search: Search,
  "layout-dashboard": LayoutDashboard,
};

export function getStudyIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || FileText;
}
