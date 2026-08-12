import {
  Users,
  DollarSign,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  TrendingUp,
  Hourglass,
  Stethoscope,
  ShieldCheck,
  Circle,
  type LucideIcon,
} from 'lucide-react';

const iconDict: Record<string, LucideIcon> = {
  Users,
  DollarSign,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  TrendingUp,
  Hourglass,
  Stethoscope,
  ShieldCheck,
};

export function getIcon(name: string): LucideIcon {
  return iconDict[name] ?? Circle;
}
