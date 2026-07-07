"use client";

import { useCallback, useMemo } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { TaskStatus } from "@/types/task";

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
const DEFAULT_SORT = "createdAt,desc";
const VALID_STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export interface TaskFilters {
  keyword: string;
  status?: TaskStatus;
  page: number;
  size: number;
  sort: string;
}

export interface UseTaskFiltersResult {
  filters: TaskFilters;
  setKeyword: (keyword: string) => void;
  setStatus: (status?: TaskStatus) => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setSort: (sort: string) => void;
}

function parseNonNegativeInteger(value: string | null, fallbackValue: number): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return fallbackValue;
  }

  return parsedValue;
}

function parsePositiveInteger(value: string | null, fallbackValue: number): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallbackValue;
  }

  return parsedValue;
}

function parseStatus(value: string | null): TaskStatus | undefined {
  if (!value) {
    return undefined;
  }

  return VALID_STATUSES.find((status) => status === value);
}

export function useTaskFilters(): UseTaskFiltersResult {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo<TaskFilters>(() => {
    const keyword = searchParams.get("keyword") ?? "";
    const status = parseStatus(searchParams.get("status"));
    const page = parseNonNegativeInteger(searchParams.get("page"), DEFAULT_PAGE);
    const size = parsePositiveInteger(searchParams.get("size"), DEFAULT_SIZE);
    const sort = searchParams.get("sort") || DEFAULT_SORT;

    return {
      keyword,
      status,
      page,
      size,
      sort,
    };
  }, [searchParams]);

  const replaceFilters = useCallback(
    (updates: Partial<TaskFilters>) => {
      const nextFilters: TaskFilters = {
        ...filters,
        ...updates,
      };

      const nextSearchParams = new URLSearchParams();

      if (nextFilters.status) {
        nextSearchParams.set("status", nextFilters.status);
      }

      if (nextFilters.keyword) {
        nextSearchParams.set("keyword", nextFilters.keyword);
      }

      nextSearchParams.set("page", String(nextFilters.page));
      nextSearchParams.set("size", String(nextFilters.size));
      nextSearchParams.set("sort", nextFilters.sort);

      const nextQueryString = nextSearchParams.toString().replace(/%2C/gi, ",");
      const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [filters, pathname, router],
  );

  const setKeyword = useCallback(
    (keyword: string) => {
      replaceFilters({
        keyword,
        page: DEFAULT_PAGE,
      });
    },
    [replaceFilters],
  );

  const setStatus = useCallback(
    (status?: TaskStatus) => {
      replaceFilters({
        status,
        page: DEFAULT_PAGE,
      });
    },
    [replaceFilters],
  );

  const setPage = useCallback(
    (page: number) => {
      replaceFilters({
        page: Math.max(DEFAULT_PAGE, page),
      });
    },
    [replaceFilters],
  );

  const setSize = useCallback(
    (size: number) => {
      replaceFilters({
        size: Math.max(1, size),
        page: DEFAULT_PAGE,
      });
    },
    [replaceFilters],
  );

  const setSort = useCallback(
    (sort: string) => {
      replaceFilters({
        sort,
        page: DEFAULT_PAGE,
      });
    },
    [replaceFilters],
  );

  return {
    filters,
    setKeyword,
    setStatus,
    setPage,
    setSize,
    setSort,
  };
}
