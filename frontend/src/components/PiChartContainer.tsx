import PiChart from './PiChart';

// Define the shape of a single item within an order
interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

// Define the shape of a single order object
interface Order {
  items: OrderItem[];
}

// Define the shape of the data that the PiChart component expects
interface TopProductData {
  name: string;
  sales: number;
}

let topProducts: TopProductData[] = [];

async function PiChartContainer({ last = '7' }: { last: string }) {
  let orders: Order[] = []; // Default to an empty array

  try {
    // 1. Fetch data from your backend orders API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders?last=${last}`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // 2. Parse the JSON, expecting { success: true, data: [...] }
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      orders = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch data for PiChart:', error);
    // Let the component render with empty data if fetch fails
  }

  // 3. Process the fetched data (this logic is correct)
  if (orders.length > 0) {
    const productSales: { [key: string]: number } = {};

    orders.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const productName = item.productName;
          const itemTotal = item.quantity * item.price;

          if (productSales[productName]) {
            productSales[productName] += itemTotal;
          } else {
            productSales[productName] = itemTotal;
          }
        });
      }
    });

    topProducts = Object.keys(productSales)
      .map((name) => ({ name, sales: productSales[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);
  }

  return <PiChart topProducts={topProducts} />;
}

export default PiChartContainer;
export { topProducts };