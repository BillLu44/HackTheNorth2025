import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Initialize DynamoDB client
export const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "ca-central-1",
  credentials: {
    accessKeyId: process.env.AWS_API_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});