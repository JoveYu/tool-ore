import React from "react";
import {
  Image,
  FileText,
  Code2,
  KeyRound,
  ArrowLeftRight,
  Film,
  Minimize2,
  RefreshCw,
  GitCompare,
  AlignLeft,
  Braces,
  Hash,
  Binary,
  QrCode,
  Coins,
  Pipette,
  Regex,
  Lock,
  Barcode,
  Smile,
  Dices,
  ShieldCheck,
  Wrench,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Image,
  FileText,
  Code2,
  KeyRound,
  ArrowLeftRight,
  Film,
  Minimize2,
  RefreshCw,
  GitCompare,
  AlignLeft,
  Braces,
  Hash,
  Binary,
  QrCode,
  Coins,
  Pipette,
  Regex,
  Lock,
  Barcode,
  Smile,
  Dices,
  ShieldCheck,
  Wrench,
};

interface DynamicIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name = "Wrench",
  className = "w-5 h-5",
  size,
}) => {
  const IconComponent = (name && ICON_MAP[name]) || Wrench;
  return <IconComponent className={className} size={size} />;
};
