import { scanTable } from "@/lib/dynamodb/functions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ crud: string }> }
) {
  const { crud } = await params;
  const { searchParams } = new URL(request.url);

  try {
    switch (crud) {
      case "scan":
        const tableName = "shopping_products";
        const keyParam = searchParams.get("key");

        if (!tableName || !keyParam) {
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
