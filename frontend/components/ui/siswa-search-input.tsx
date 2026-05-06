"use client";

import { useEffect, useRef, useState } from "react";
import { Siswa } from "@/services/api/siswaService";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface SiswaSearchInputProps {
  siswaList: Siswa[];
  value: number | null;
  onChange: (id: number) => void;
  error?: string;
}

export function SiswaSearchInput({ siswaList, value, onChange, error }: SiswaSearchInputProps) {
  const selected = siswaList.find(s => s.id === value) ?? null;
  const [query, setQuery] = useState(selected ? `${selected.nama} (${selected.nisn})` : "");
  const [prevValue, setPrevValue] = useState(value);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const ref = useRef<HTMLDivElement>(null);

  // Sync label when value changes externally (e.g. form reset) — React-safe derived state pattern
  if (prevValue !== value) {
    setPrevValue(value);
    const s = value ? siswaList.find(s => s.id === value) : null;
    setQuery(s ? `${s.nama} (${s.nisn})` : "");
  }

  const filtered = debouncedQuery.trim() ? siswaList.filter(s => s.nama.toLowerCase().includes(debouncedQuery.toLowerCase()) || s.nisn.toLowerCase().includes(debouncedQuery.toLowerCase())) : siswaList.slice(0, 20);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        // Reset query to selected label if closed without picking
        if (value) {
          const s = siswaList.find(s => s.id === value);
          if (s) setQuery(`${s.nama} (${s.nisn})`);
        } else {
          setQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [value, siswaList]);

  return (
    <div ref={ref} className="relative">
      <Input
        placeholder="Cari nama atau NISN..."
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {open && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-input bg-popover text-sm shadow-md">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">Tidak ditemukan</li>
          ) : (
            filtered.map(s => (
              <li
                key={s.id}
                className={`cursor-pointer px-3 py-2 hover:bg-accent ${s.id === value ? "bg-accent font-medium" : ""}`}
                onMouseDown={e => {
                  e.preventDefault();
                  onChange(s.id);
                  setQuery(`${s.nama} (${s.nisn})`);
                  setOpen(false);
                }}
              >
                {s.nama} <span className="text-muted-foreground">({s.nisn})</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
