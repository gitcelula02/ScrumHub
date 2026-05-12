/**
 * @component ViewSizeToggle
 * Toggle between compact, medium, and big view sizes.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (uses neutral UI colors)
 */

import { memo } from "react";
import { AlignJustify, AlignCenter, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViewSize } from "../types/explorerTypes";

interface ViewSizeToggleProps {
  value: ViewSize;
  onChange: (size: ViewSize) => void;
}

const SIZES: { value: ViewSize; icon: typeof AlignJustify; label: string }[] = [
  { value: "compact", icon: AlignJustify, label: "Compact" },
  { value: "medium", icon: AlignCenter, label: "Medium" },
  { value: "big", icon: AlignLeft, label: "Big" },
];

function ViewSizeToggleComponent({ value, onChange }: ViewSizeToggleProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1">
      {SIZES.map(({ value: size, icon: Icon, label }) => (
        <Button
          key={size}
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${value === size ? "bg-list-active" : ""}`}
          onClick={() => onChange(size)}
          title={label}
        >
          <Icon size={14} />
        </Button>
      ))}
    </div>
  );
}

export const ViewSizeToggle = memo(ViewSizeToggleComponent);