export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public path: string;
  public operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  public requestResourceData?: any;

  constructor({ path, operation, requestResourceData }: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions for ${operation} on ${path}.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.path = path;
    this.operation = operation;
    this.requestResourceData = requestResourceData;
  }

  toContextObject() {
    return {
      message: this.message,
      path: this.path,
      operation: this.operation,
      requestResourceData: this.requestResourceData,
    };
  }
}
