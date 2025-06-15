import TableBody from './TableBody';

/**
 * A comprehensive Product interface that includes all fields
 * used across your components to prevent type conflicts.
 */
interface Product {
  id: string;
  name: string;          // From your backend fetch
  productName: string;   // Expected by TableBody
  price: number;
  quantity: number;      // From your backend fetch
  stock: number;         // Expected by TableBody
  category: { name: string };
  createdAt: string;     // Expected by TableBody
  imageUrls?: string[];  // Expected by TableBody
}

// It's a good practice to use singular for the type name (Product) and plural for the array (products).
let latestProducts: Product[];

async function Latest3Products() {
  let products: Partial<Product>[] = []; // Use Partial<Product> for the fetched data

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      products = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch latest products:', error);
  }

  // Map the fetched data to the structure expected by the TableBody component
  const formattedProducts: Product[] = products.map(p => ({
    id: p.id || '',
    name: p.name || '',
    productName: p.name || '', // Map 'name' to 'productName'
    price: p.price || 0,
    quantity: p.quantity || 0,
    stock: p.quantity || 0,    // Map 'quantity' to 'stock'
    category: p.category || { name: 'Uncategorized' },
    createdAt: p.createdAt || new Date().toISOString(), // Provide a fallback
    imageUrls: p.imageUrls || [],
  }));

  latestProducts = formattedProducts.slice(0, 3);

  return (
    <>
      <h2 className="text-card-foreground mb-4 text-xl font-semibold">
        Latest Products
      </h2>
      <table className="bg-card w-full rounded-lg p-4 shadow-md">
        {latestProducts.length > 0 ? (
          // This now passes the correctly structured products
          <TableBody products={latestProducts} />
        ) : (
          <tbody>
            <tr>
              <td className="text-muted-foreground p-4">No products found.</td>
            </tr>
          </tbody>
        )}
      </table>
    </>
  );
}

export default Latest3Products;
export { latestProducts };