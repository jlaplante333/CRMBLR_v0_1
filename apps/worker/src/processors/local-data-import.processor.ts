import { Job } from 'bullmq';
import { db } from '@crmblr/db';
import { LocalFileService } from '../services/local-file.service';
import { DataParserService } from '../services/data-parser.service';

export interface LocalDataImportJobData {
  tenantId: string;
  filePath: string;
  contentType: string;
  mapping: Record<string, string>;
  options: {
    skipFirstRow?: boolean;
    delimiter?: string;
  };
}

export class LocalDataImportProcessor {
  private localFileService: LocalFileService;
  private dataParserService: DataParserService;

  constructor() {
    this.localFileService = new LocalFileService();
    this.dataParserService = new DataParserService();
  }

  async process(job: Job<LocalDataImportJobData>) {
    const { tenantId, filePath, contentType, mapping, options } = job.data;
    
    try {
      console.log(`📥 Processing local data import for tenant ${tenantId}`);
      console.log(`📁 File: ${filePath}`);
      
      // Update job progress
      await job.updateProgress(10);
      
      // Read file from local filesystem
      const fileBuffer = await this.localFileService.getFile(filePath);
      console.log(`📁 Read file: ${filePath} (${fileBuffer.length} bytes)`);
      
      await job.updateProgress(30);
      
      // Parse file based on content type
      let parsedData: any[];
      
      if (contentType.includes('csv') || contentType.includes('text/csv')) {
        parsedData = await this.dataParserService.parseCSV(fileBuffer, options);
      } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
        parsedData = await this.dataParserService.parseExcel(fileBuffer);
      } else {
        throw new Error(`Unsupported file type: ${contentType}`);
      }
      
      console.log(`📊 Parsed ${parsedData.length} records`);
      await job.updateProgress(50);
      
      // Set tenant context for RLS
      await db.setTenantContext(tenantId, 'system');
      
      // Process and import data
      const results = await this.processRecords(parsedData, mapping, tenantId);
      
      await job.updateProgress(90);
      
      // Create file asset record
      const stats = this.localFileService.getFileStats(filePath);
      await db.client.fileAsset.create({
        data: {
          tenantId,
          key: filePath,
          bucket: 'local',
          contentType,
          size: stats.size,
          source: 'etl',
          meta: {
            recordCount: parsedData.length,
            processedCount: results.processed,
            errorCount: results.errors,
            mapping,
            localPath: filePath,
          },
        },
      });
      
      await job.updateProgress(100);
      
      await db.clearTenantContext();
      
      console.log(`✅ Local data import completed: ${results.processed} processed, ${results.errors} errors`);
      
      return {
        success: true,
        processed: results.processed,
        errors: results.errors,
        total: parsedData.length,
        filePath,
      };
      
    } catch (error) {
      console.error(`❌ Local data import failed:`, error);
      await db.clearTenantContext();
      throw error;
    }
  }

  private async processRecords(
    records: any[],
    mapping: Record<string, string>,
    tenantId: string
  ): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;

    for (const record of records) {
      try {
        // Map fields based on mapping configuration
        const mappedRecord = this.mapRecord(record, mapping, tenantId);
        
        // Determine entity type and create record
        if (mappedRecord.entityType === 'contact') {
          await this.createContact(mappedRecord);
        } else if (mappedRecord.entityType === 'donation') {
          await this.createDonation(mappedRecord);
        } else if (mappedRecord.entityType === 'organization') {
          await this.createOrganization(mappedRecord);
        }
        
        processed++;
      } catch (error) {
        console.error(`Error processing record:`, error);
        errors++;
      }
    }

    return { processed, errors };
  }

  private mapRecord(record: any, mapping: Record<string, string>, tenantId: string): any {
    const mapped: any = { tenantId };
    
    for (const [sourceField, targetField] of Object.entries(mapping)) {
      if (record[sourceField] !== undefined) {
        mapped[targetField] = record[sourceField];
      }
    }
    
    return mapped;
  }

  private async createContact(data: any) {
    return await db.client.contact.create({
      data: {
        tenantId: data.tenantId,
        firstName: data.firstName || 'Unknown',
        lastName: data.lastName || 'Contact',
        email: data.email,
        phone: data.phone,
        address: data.address,
        score: data.score || 0,
        lifetimeValue: data.lifetimeValue || 0,
        stage: data.stage || 'identified',
        custom: data.custom || {},
      },
    });
  }

  private async createDonation(data: any) {
    return await db.client.donation.create({
      data: {
        tenantId: data.tenantId,
        contactId: data.contactId,
        organizationId: data.organizationId,
        campaignId: data.campaignId,
        amount: parseFloat(data.amount) || 0,
        currency: data.currency || 'USD',
        date: new Date(data.date) || new Date(),
        thankYouStatus: data.thankYouStatus || 'none',
        custom: data.custom || {},
      },
    });
  }

  private async createOrganization(data: any) {
    return await db.client.organization.create({
      data: {
        tenantId: data.tenantId,
        name: data.name || 'Unknown Organization',
        type: data.type || 'partner',
        website: data.website,
        location: data.location,
        custom: data.custom || {},
      },
    });
  }
}
