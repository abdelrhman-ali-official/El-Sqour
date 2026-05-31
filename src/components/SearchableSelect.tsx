import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  id: number;
  name: string;
};

type SearchableSelectProps = {
  label: string;
  placeholder: string;
  icon: LucideIcon;
  options: Option[];
  value: number | null;
  onChange: (value: number) => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function SearchableSelect({
  label,
  placeholder,
  icon: Icon,
  options,
  value,
  onChange,
  loading = false,
  disabled = false
}: SearchableSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }
    const selected = options.find((option) => option.id === value);
    if (selected) {
      setQuery(selected.name);
    }
  }, [options, value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return options;
    const normalized = trimmed.toLowerCase();
    return options.filter((option) => option.name.toLowerCase().includes(normalized));
  }, [options, query]);

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setQuery(option.name);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="flex min-h-14 flex-col items-start justify-center gap-1 rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus-within:ring-2 focus-within:ring-brand-red/30 sm:min-h-0 sm:flex-row sm:items-center sm:gap-3 lg:min-h-[52px] lg:px-3.5 lg:py-2.5">
        <Icon className="h-4 w-4 text-brand-red" />
        <span className="text-xs text-slate-400">{label}</span>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!disabled) setOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
        />
      </label>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-44 overflow-auto rounded-2xl border border-white/80 bg-white/95 p-2 shadow-soft sm:max-h-56 lg:max-h-52">
          {loading ? (
            <div className="px-3 py-2 text-xs text-slate-500">جار التحميل...</div>
          ) : filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className="flex w-full items-center rounded-xl px-3 py-2 text-right text-sm text-slate-700 transition hover:bg-brand-red/10 hover:text-brand-red"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(option);
                }}
              >
                {option.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-slate-500">لا توجد نتائج مطابقة.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
