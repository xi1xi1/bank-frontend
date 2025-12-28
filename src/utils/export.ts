// src/utils/export.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency } from './formatter';

// 导出为Excel
export const exportToExcel = (
  data: any[],
  fileName: string = '交易记录',
  sheetName: string = 'Sheet1'
) => {
  try {
    if (!data || data.length === 0) {
      console.warn('没有数据可导出');
      return false;
    }

    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    // 将数据转换为工作表
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 设置列宽
    const maxWidth = 25;
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const colWidths = headers.map(key => ({
        wch: Math.min(maxWidth, Math.max(key.length, 12))
      }));
      worksheet['!cols'] = colWidths;
    }
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    });
    
    // 创建Blob并下载
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    const timestamp = new Date().getTime();
    saveAs(blob, `${fileName}_${timestamp}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('导出Excel失败:', error);
    return false;
  }
};

// 导出为CSV
export const exportToCSV = (
  data: any[],
  fileName: string = '交易记录'
) => {
  try {
    if (!data || data.length === 0) {
      console.warn('没有数据可导出');
      return false;
    }
    
    // 获取表头
    const headers = Object.keys(data[0]);
    
    // 构建CSV内容
    const csvRows = [];
    
    // 添加表头
    csvRows.push(headers.join(','));
    
    // 添加数据行
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // 处理特殊字符
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      });
      csvRows.push(values.join(','));
    });
    
    // 创建CSV字符串
    const csvString = csvRows.join('\n');
    const BOM = '\uFEFF'; // UTF-8 BOM
    const blob = new Blob([BOM + csvString], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const timestamp = new Date().getTime();
    saveAs(blob, `${fileName}_${timestamp}.csv`);
    
    return true;
  } catch (error) {
    console.error('导出CSV失败:', error);
    return false;
  }
};

// 导出为PDF - 修复版本
export const exportToPDF = async (
  transactions: any[],
  summary: any,
  filters?: {
    searchText?: string;
    typeFilter?: string;
    dateRange?: any[];
  },
  fileName: string = '交易记录报告'
) => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error('没有数据可导出');
    }

    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // 添加标题
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('交易记录报告', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // 添加生成时间
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`生成时间: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // 添加筛选条件
    if (filters) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('筛选条件:', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      let conditionText = '';
      if (filters.searchText) {
        conditionText += `搜索: ${filters.searchText}  `;
      }
      if (filters.typeFilter && filters.typeFilter !== 'all') {
        conditionText += `类型: ${filters.typeFilter === 'deposit' ? '存款' : '取款'}  `;
      }
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        conditionText += `时间: ${filters.dateRange[0].toLocaleDateString()} 至 ${filters.dateRange[1].toLocaleDateString()}`;
      }
      
      if (conditionText) {
        pdf.text(conditionText, margin, yPos);
        yPos += 10;
      }
    }

    // 添加统计信息
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('交易统计:', margin, yPos);
    yPos += 8;

    const stats = [
      { label: '存款总额', value: `¥${formatCurrency(summary.totalDeposit)}`, color: [82, 196, 26] },
      { label: '取款总额', value: `¥${formatCurrency(summary.totalWithdraw)}`, color: [255, 77, 79] },
      { label: '交易总额', value: `¥${formatCurrency(summary.totalTransaction)}`, color: [24, 144, 255] },
      { label: '交易笔数', value: summary.transactionCount.toString(), color: [250, 140, 22] }
    ];

    pdf.setFontSize(10);
    stats.forEach((stat, index) => {
      const xPos = margin + index * (contentWidth / 4);
      
      // 绘制背景框
      pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2], 10);
      pdf.roundedRect(xPos, yPos, contentWidth / 4 - 5, 20, 2, 2, 'F');
      
      // 添加文本
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text(stat.label, xPos + 5, yPos + 8);
      
      pdf.setFontSize(12);
      pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      pdf.text(stat.value, xPos + 5, yPos + 15);
    });

    yPos += 25;

    // 添加交易明细标题
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`交易明细 (共 ${transactions.length} 条记录)`, margin, yPos);
    yPos += 10;

    // 创建表格
    const tableHeaders = ['序号', '交易时间', '交易类型', '流水号', '金额', '余额', '银行卡号', '状态', '备注'];
    const columnWidths = [8, 25, 15, 35, 20, 20, 25, 15, 27];
    
    // 检查是否需要换页
    if (yPos + 60 > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }

    // 绘制表头
    pdf.setFillColor(58, 89, 152);
    pdf.setDrawColor(58, 89, 152);
    pdf.rect(margin, yPos, contentWidth, 8, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    
    let xPos = margin;
    tableHeaders.forEach((header, index) => {
      pdf.text(header, xPos + 2, yPos + 6);
      xPos += columnWidths[index];
    });

    yPos += 8;

    // 绘制表格数据
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    transactions.forEach((transaction, rowIndex) => {
      // 检查是否需要换页
      if (yPos + 8 > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        
        // 在新页面重新绘制表头
        pdf.setFillColor(58, 89, 152);
        pdf.rect(margin, yPos, contentWidth, 8, 'F');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        
        let headerXPos = margin;
        tableHeaders.forEach((header, index) => {
          pdf.text(header, headerXPos + 2, yPos + 6);
          headerXPos += columnWidths[index];
        });
        
        yPos += 8;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
      }

      // 交替行背景色
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPos, contentWidth, 8, 'F');
      }

      // 设置行边框
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPos, contentWidth, 8);

      // 绘制单元格数据
      const rowData = [
        (rowIndex + 1).toString(),
        formatTransactionDate(transaction.transTime),
        transaction.transType,
        transaction.transNo || '',
        formatTransactionAmount(transaction),
        formatCurrency(transaction.balanceAfter || 0),
        formatCardId(transaction.cardId),
        transaction.status,
        transaction.remark || '-'
      ];

      xPos = margin;
      rowData.forEach((cell, colIndex) => {
        const cellWidth = columnWidths[colIndex];
        
        // 特殊格式处理
        if (colIndex === 4) { // 金额列
          const color = transaction.transType === '存款' ? [82, 196, 26] : [255, 77, 79];
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.setFont('helvetica', 'bold');
        } else if (colIndex === 6) { // 银行卡号列
          pdf.setTextColor(100, 100, 100);
        } else {
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
        }

        // 绘制文本（截断过长的文本）
        const text = cell.length > 15 ? cell.substring(0, 12) + '...' : cell;
        pdf.text(text, xPos + 2, yPos + 6, { maxWidth: cellWidth - 4 });
        
        xPos += cellWidth;
      });

      yPos += 8;
    });

    // 添加页脚 - 使用类型断言解决 getNumberOfPages 问题
    const pdfDoc = pdf as any;
    const totalPages = pdfDoc.internal.getNumberOfPages ? pdfDoc.internal.getNumberOfPages() : 1;
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `第 ${i} 页 / 共 ${totalPages} 页`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
      pdf.text(
        `生成系统: 银行交易管理系统 | 报告时间: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // 保存文件
    const timestamp = new Date().getTime();
    pdf.save(`${fileName}_${timestamp}.pdf`);
    
    return true;
  } catch (error) {
    console.error('导出PDF失败:', error);
    return false;
  }
};


// 辅助函数：格式化交易日期
const formatTransactionDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch {
    return dateString;
  }
};

// 辅助函数：格式化交易金额
const formatTransactionAmount = (transaction: any): string => {
  const prefix = transaction.transType === '存款' ? '+' : '-';
  return `${prefix}${formatCurrency(transaction.amount)}`;
};

// 辅助函数：格式化银行卡号
const formatCardId = (cardId: string): string => {
  if (!cardId) return '-';
  if (cardId.length <= 8) return cardId;
  return `${cardId.substring(0, 4)} **** **** ${cardId.substring(cardId.length - 4)}`;
};

// 格式化交易数据用于导出
export const formatTransactionDataForExport = (transactions: any[]) => {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }
  
  return transactions.map((tx, index) => {
    // 格式化日期
    let formattedDate = '';
    if (tx.transTime) {
      try {
        const date = new Date(tx.transTime);
        formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      } catch {
        formattedDate = tx.transTime;
      }
    }
    
    // 格式化金额
    const amountPrefix = tx.transType === '存款' ? '+' : '-';
    const formattedAmount = `${amountPrefix}${formatCurrency(tx.amount)}`;
    
    return {
      '序号': index + 1,
      '交易流水号': tx.transNo || '',
      '交易时间': formattedDate,
      '交易类型': tx.transType || '',
      '交易子类型': tx.transSubtype || '',
      '银行卡号': tx.cardId || '',
      '交易金额': formattedAmount,
      '交易金额(数值)': tx.amount || 0,
      '交易前余额': formatCurrency(tx.balanceBefore || 0),
      '交易后余额': formatCurrency(tx.balanceAfter || 0),
      '手续费': formatCurrency(tx.fee || 0),
      '交易状态': tx.status || '',
      '备注': tx.remark || ''
    };
  });
};

// 导出交易记录统计
export const exportTransactionSummary = (summary: any, transactions: any[]) => {
  const depositTransactions = transactions.filter(tx => tx.transType === '存款');
  const withdrawTransactions = transactions.filter(tx => tx.transType === '取款');
  
  return {
    '统计时间': new Date().toLocaleString(),
    '总交易笔数': summary.transactionCount,
    '存款笔数': depositTransactions.length,
    '取款笔数': withdrawTransactions.length,
    '存款总额': formatCurrency(summary.totalDeposit),
    '取款总额': formatCurrency(summary.totalWithdraw),
    '交易总额': formatCurrency(summary.totalTransaction),
    '平均存款金额': depositTransactions.length > 0 
      ? formatCurrency(summary.totalDeposit / depositTransactions.length)
      : '0.00',
    '平均取款金额': withdrawTransactions.length > 0
      ? formatCurrency(summary.totalWithdraw / withdrawTransactions.length)
      : '0.00',
    '最大存款金额': depositTransactions.length > 0
      ? formatCurrency(Math.max(...depositTransactions.map(tx => tx.amount)))
      : '0.00',
    '最大取款金额': withdrawTransactions.length > 0
      ? formatCurrency(Math.max(...withdrawTransactions.map(tx => tx.amount)))
      : '0.00'
  };
};