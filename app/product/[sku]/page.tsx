import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  return <ProductDetailClient sku={sku} />;
}
