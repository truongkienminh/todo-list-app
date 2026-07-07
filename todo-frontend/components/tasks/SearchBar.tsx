"use client";

import { useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  disabled?: boolean;
}

export function SearchBar({
  keyword,
  onKeywordChange,
  disabled = false,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(keyword);
  const debouncedKeyword = useDebounce(inputValue, 400);

  useEffect(() => {
    setInputValue(keyword);
  }, [keyword]);

  useEffect(() => {
    if (debouncedKeyword === keyword) {
      return;
    }

    onKeywordChange(debouncedKeyword);
  }, [debouncedKeyword, keyword, onKeywordChange]);

  return (
    <label className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <svg
        aria-hidden="true"
        className="h-5 w-5 flex-none text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="11" cy="11" r="6" />
      </svg>

      <input
        className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
        disabled={disabled}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="Tìm theo tiêu đề hoặc mô tả..."
        type="search"
        value={inputValue}
      />
    </label>
  );
}
