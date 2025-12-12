import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  pageSize: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  currentData: T[];
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  canNextPage: boolean;
  canPrevPage: boolean;
}

export function usePagination<T>({
  data,
  pageSize,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / currentPageSize));
  }, [data.length, currentPageSize]);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, currentPageSize]);

  const setPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const setSize = (size: number) => {
    setCurrentPageSize(size);
    // 重置到第一页以避免空页
    setCurrentPage(1);
  };

  const nextPage = () => {
    setPage(currentPage + 1);
  };

  const prevPage = () => {
    setPage(currentPage - 1);
  };

  const goToPage = (page: number) => {
    setPage(page);
  };

  const canNextPage = currentPage < totalPages;
  const canPrevPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    currentData,
    pageSize: currentPageSize,
    setCurrentPage: setPage,
    setPageSize: setSize,
    nextPage,
    prevPage,
    goToPage,
    canNextPage,
    canPrevPage,
  };
}