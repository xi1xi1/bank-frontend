// src/types/global.d.ts
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    internal: {
      getNumberOfPages: () => number;
      pageSize: {
        width: number;
        height: number;
      };
    };
    setPage: (pageNumber: number) => void;
  }
}

declare module 'file-saver' {
  export function saveAs(data: Blob, filename: string): void;
}