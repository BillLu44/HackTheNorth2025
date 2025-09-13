export interface DynamoDBKey {
  [key: string]: any;
}

export interface QueryOptions {
  indexName?: string;
  limit?: number;
  exclusiveStartKey?: DynamoDBKey;
  scanIndexForward?: boolean;
  filterExpression?: string;
  projectionExpression?: string;
}

export interface ScanOptions {
  limit?: number;
  exclusiveStartKey?: DynamoDBKey;
  filterExpression?: string;
  projectionExpression?: string;
}