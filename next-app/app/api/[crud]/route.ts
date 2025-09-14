import { scanTable } from "@/lib/dynamodb/functions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ crud: string }> }
) {
  const { crud } = await params;

  try {
    switch (crud) {
      case "scan":
        const tableName = "shopping_products";

        if (!tableName) {
          return Response.json(
            { error: "tableName and key parameters are required" },
            { status: 400 }
          );
        }

        const items = await scanTable(tableName);

        if (!items) {
          return Response.json({ error: "Item not found" }, { status: 404 });
        }

        return Response.json(items.items);
    }
  } catch (error) {
    console.error(`Error in ${crud} operation:`, error);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
