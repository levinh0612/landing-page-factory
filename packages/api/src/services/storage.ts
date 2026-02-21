export interface StorageService {
  /** Extract ZIP → uploads/templates/{id}/v{version}/, returns relative path */
  save(templateId: string, version: number, zipBuffer: Buffer): Promise<string>;
  /** Resolve relative path to absolute filesystem path */
  getAbsolutePath(relativePath: string): string;
  /** Remove all files for a template */
  delete(templateId: string): Promise<void>;
  /** Check if version directory exists */
  exists(templateId: string, version: number): boolean;
  /** Recursive listing of files in a version directory */
  listFiles(templateId: string, version: number): string[];
}
