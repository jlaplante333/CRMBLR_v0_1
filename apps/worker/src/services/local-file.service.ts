import * as fs from 'fs';
import * as path from 'path';

export class LocalFileService {
  private uploadsDir: string;

  constructor(uploadsDir: string = './uploads') {
    this.uploadsDir = uploadsDir;
    this.ensureUploadsDir();
  }

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveFile(fileBuffer: Buffer, filename: string, tenantId: string): Promise<string> {
    const tenantDir = path.join(this.uploadsDir, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const filePath = path.join(tenantDir, filename);
    fs.writeFileSync(filePath, fileBuffer);
    
    return filePath;
  }

  async getFile(filePath: string): Promise<Buffer> {
    return fs.readFileSync(filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async listFiles(tenantId: string): Promise<string[]> {
    const tenantDir = path.join(this.uploadsDir, tenantId);
    if (!fs.existsSync(tenantDir)) {
      return [];
    }
    
    return fs.readdirSync(tenantDir);
  }

  getFileStats(filePath: string): { size: number; mtime: Date } {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime,
    };
  }
}
