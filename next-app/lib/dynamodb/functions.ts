import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand, 
  ScanCommand,
  BatchGetCommand,
  BatchWriteCommand
} from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "./client";
import { DynamoDBKey, QueryOptions, ScanOptions } from "@/types/dbTypes";

// Create document client for easier JSON handling
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// GET - Retrieve a single item
export async function getItem(tableName: string, key: DynamoDBKey) {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });
    
    const response = await docClient.send(command);
    return response.Item || null;
  } catch (error) {
    console.error(`Error getting item from ${tableName}:`, error);
    throw new Error(`Failed to get item from ${tableName}`);
  }
}

// PUT - Create or update an item
export async function putItem(tableName: string, item: Record<string, any>) {
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    
    await docClient.send(command);
    return item;
  } catch (error) {
    console.error(`Error putting item to ${tableName}:`, error);
    throw new Error(`Failed to put item to ${tableName}`);
  }
}

// UPDATE - Update an existing item
export async function updateItem(
  tableName: string, 
  key: DynamoDBKey, 
  updateExpression: string,
  expressionAttributeValues: Record<string, any>,
  expressionAttributeNames?: Record<string, string>
) {
  try {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW",
    });
    
    const response = await docClient.send(command);
    return response.Attributes;
  } catch (error) {
    console.error(`Error updating item in ${tableName}:`, error);
    throw new Error(`Failed to update item in ${tableName}`);
  }
}

// DELETE - Delete an item
export async function deleteItem(tableName: string, key: DynamoDBKey) {
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
      ReturnValues: "ALL_OLD",
    });
    
    const response = await docClient.send(command);
    return response.Attributes;
  } catch (error) {
    console.error(`Error deleting item from ${tableName}:`, error);
    throw new Error(`Failed to delete item from ${tableName}`);
  }
}

// QUERY - Query items with partition key
export async function queryItems(
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>,
  expressionAttributeNames?: Record<string, string>,
  options?: QueryOptions
) {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      IndexName: options?.indexName,
      Limit: options?.limit,
      ExclusiveStartKey: options?.exclusiveStartKey,
      ScanIndexForward: options?.scanIndexForward,
      FilterExpression: options?.filterExpression,
      ProjectionExpression: options?.projectionExpression,
    });
    
    const response = await docClient.send(command);
    return {
      items: response.Items || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
      count: response.Count,
      scannedCount: response.ScannedCount
    };
  } catch (error) {
    console.error(`Error querying ${tableName}:`, error);
    throw new Error(`Failed to query ${tableName}`);
  }
}

// SCAN - Scan entire table (use sparingly!)
export async function scanTable(
  tableName: string,
  options?: ScanOptions
) {
  try {
    const command = new ScanCommand({
      TableName: tableName,
      Limit: options?.limit,
      ExclusiveStartKey: options?.exclusiveStartKey,
      FilterExpression: options?.filterExpression,
      ProjectionExpression: options?.projectionExpression,
    });
    
    const response = await docClient.send(command);
    return {
      items: response.Items || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
      count: response.Count,
      scannedCount: response.ScannedCount
    };
  } catch (error) {
    console.error(`Error scanning ${tableName}:`, error);
    throw new Error(`Failed to scan ${tableName}`);
  }
}

// BATCH GET - Get multiple items at once
export async function batchGetItems(
  requestItems: Record<string, { Keys: DynamoDBKey[] }>
) {
  try {
    const command = new BatchGetCommand({
      RequestItems: requestItems,
    });
    
    const response = await docClient.send(command);
    return {
      responses: response.Responses || {},
      unprocessedKeys: response.UnprocessedKeys || {}
    };
  } catch (error) {
    console.error("Error batch getting items:", error);
    throw new Error("Failed to batch get items");
  }
}

// BATCH WRITE - Put/Delete multiple items at once
export async function batchWriteItems(
  requestItems: Record<string, any[]>
) {
  try {
    const command = new BatchWriteCommand({
      RequestItems: requestItems,
    });
    
    const response = await docClient.send(command);
    return {
      unprocessedItems: response.UnprocessedItems || {}
    };
  } catch (error) {
    console.error("Error batch writing items:", error);
    throw new Error("Failed to batch write items");
  }
}

// Utility function for paginated queries
export async function queryAllItems(
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>,
  expressionAttributeNames?: Record<string, string>,
  options?: Omit<QueryOptions, 'exclusiveStartKey'>
) {
  const allItems: any[] = [];
  let lastEvaluatedKey: DynamoDBKey | undefined;

  do {
    const result = await queryItems(
      tableName,
      keyConditionExpression,
      expressionAttributeValues,
      expressionAttributeNames,
      { ...options, exclusiveStartKey: lastEvaluatedKey }
    );

    allItems.push(...result.items);
    lastEvaluatedKey = result.lastEvaluatedKey;
  } while (lastEvaluatedKey);

  return allItems;
}

export { docClient };