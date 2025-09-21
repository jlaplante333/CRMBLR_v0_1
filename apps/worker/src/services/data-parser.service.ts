import * as csv from 'csv-parser';
import * as XLSX from 'xlsx';
import * as pdf from 'pdf-parse';
import * as xml2js from 'xml2js';
import { Readable } from 'stream';

export class DataParserService {
  async parseCSV(buffer: Buffer, options: { skipFirstRow?: boolean; delimiter?: string } = {}): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv({
          separator: options.delimiter || ',',
          skipEmptyLines: true,
        }))
        .on('data', (data) => {
          if (options.skipFirstRow && results.length === 0) {
            // Skip first row if specified
            return;
          }
          results.push(data);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async parseExcel(buffer: Buffer): Promise<any[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    return XLSX.utils.sheet_to_json(worksheet);
  }

  async parsePDF(buffer: Buffer): Promise<any[]> {
    try {
      const data = await pdf(buffer);
      
      // Extract structured data from PDF text
      // This is a simplified implementation - in production, you'd use more sophisticated parsing
      const lines = data.text.split('\n').filter(line => line.trim());
      
      const results: any[] = [];
      let currentRecord: any = {};
      
      for (const line of lines) {
        // Simple parsing logic - would need to be customized based on PDF structure
        if (line.includes('Name:')) {
          currentRecord.name = line.replace('Name:', '').trim();
        } else if (line.includes('Email:')) {
          currentRecord.email = line.replace('Email:', '').trim();
        } else if (line.includes('Amount:')) {
          currentRecord.amount = parseFloat(line.replace('Amount:', '').replace(/[^0-9.]/g, ''));
        } else if (line.includes('Date:')) {
          currentRecord.date = line.replace('Date:', '').trim();
        }
        
        // If we have a complete record, add it to results
        if (currentRecord.name && currentRecord.amount) {
          results.push({ ...currentRecord });
          currentRecord = {};
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  async parseXML(buffer: Buffer): Promise<any[]> {
    try {
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(buffer.toString());
      
      // Extract data from XML structure
      // This is a simplified implementation - would need to be customized based on XML structure
      const records: any[] = [];
      
      // Example for IRS 990 XML
      if (result.Return) {
        const returnData = result.Return;
        
        // Extract organization information
        if (returnData.ReturnHeader && returnData.ReturnHeader[0].ReturnHeaderOrgName) {
          records.push({
            organizationName: returnData.ReturnHeader[0].ReturnHeaderOrgName[0],
            ein: returnData.ReturnHeader[0].ReturnHeaderEIN?.[0],
            taxYear: returnData.ReturnHeader[0].ReturnHeaderTaxYr?.[0],
          });
        }
        
        // Extract financial data
        if (returnData.ReturnData && returnData.ReturnData[0].IRS990) {
          const irs990 = returnData.ReturnData[0].IRS990[0];
          
          if (irs990.GrossReceipts) {
            records.push({
              grossReceipts: irs990.GrossReceipts[0],
              totalRevenue: irs990.TotalRevenue?.[0],
              totalExpenses: irs990.TotalExpenses?.[0],
            });
          }
        }
      }
      
      return records;
    } catch (error) {
      throw new Error(`Failed to parse XML: ${error.message}`);
    }
  }
}
