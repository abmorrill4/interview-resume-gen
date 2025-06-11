
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface AutocompleteOption {
  value: string;
  label: string;
  data?: any;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  options,
  placeholder,
  className,
  loading = false,
  emptyMessage = "No results found"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && options.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value, options]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onSelect(options[highlightedIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: AutocompleteOption) => {
    onSelect(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value && options.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <Command>
            <CommandList ref={listRef}>
              {loading ? (
                <div className="p-2 text-sm text-muted-foreground">Loading...</div>
              ) : options.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">{emptyMessage}</div>
              ) : (
                options.map((option, index) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleOptionClick(option)}
                    className={cn(
                      "cursor-pointer",
                      index === highlightedIndex && "bg-accent"
                    )}
                  >
                    {option.label}
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
