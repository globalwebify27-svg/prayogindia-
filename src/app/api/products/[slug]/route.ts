import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PRODUCTS, Product } from "@/data/mockData";

interface Props {
  params: Promise<{ slug: string }>;
}

// GET /api/products/[slug] - Product Detail & Related Hardware Retrieval
export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    if (process.env.DATABASE_URL) {
      const dbProduct = await db.product.findFirst({
        where: {
          OR: [{ slug }, { id: slug }, { sku: slug }],
        },
        include: {
          category: true,
          images: true,
          variants: true,
        },
      });

      if (dbProduct) {
        // Retrieve Related Products in Same Category
        const related = await db.product.findMany({
          where: {
            categoryId: dbProduct.categoryId,
            NOT: { id: dbProduct.id },
          },
          take: 4,
        });

        return NextResponse.json({
          success: true,
          data: {
            ...dbProduct,
            relatedProducts: related,
          },
          source: "database",
        });
      }
    }

    const product =
      PRODUCTS.find(
        (p) =>
          p.id === slug ||
          p.sku === slug ||
          p.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .includes(slug.toLowerCase()),
      ) || PRODUCTS[0];

    const relatedProducts = PRODUCTS.filter(
      (p) => p.category === product.category && p.id !== product.id,
    ).slice(0, 4);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        relatedProducts,
      },
      source: "mock",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch product details" },
      { status: 500 },
    );
  }
}
