/**
 * @component SearchBar
 * Search input with AI trigger for natural language commands.
 *
 * COLOR CONTRACT:
 * - Consumes no entity colors (uses neutral sidebar colors)
 */

import { memo } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onAiCommand?: (command: string) => void;
  isSearching?: boolean;
}

function SearchBarComponent({ value, onChange, onAiCommand, isSearching }: SearchBarProps) {
  return (
    <div className="px-2 py-2 flex items-center gap-1">
      <div className="relative flex-1">
        <Search
          size={12}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search projects..."
          className="h-7 pl-7 pr-16 text-[12px] bg-sidebar-bg border-sidebar-border"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onAiCommand?.(value)}
        title="AI: Create project with natural language"
      >
        <Sparkles size={14} className="text-violet-400" />
      </Button>
    </div>
  );
}

export const SearchBar = memo(SearchBarComponent);