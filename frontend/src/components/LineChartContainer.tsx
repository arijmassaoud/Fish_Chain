import { format } from 'date-fns';
import LineChart from './LineChart';
import { cookies } from 'next/headers'; // <-- 1. Import cookies

// Define the Order type to match the data from your API
interface Order {
  createdAt: string; // Or Date
  totalAmount: number;
}

// Define the shape of the data processed for the chart
interface ChartData {
  name: string;
  Sells: number;
  Order: number;
}

interface LineChartContainerProps {
  last: string;
}

// These variables are fine as they are, but will be populated by the fetch
let processedData: ChartData[] = [];
let currentPeriodSales: number = 0;
let salesChange: number = 0;

async function processOrdersForChart(orders: Order[]): Promise<ChartData[]> {
  const dailyData: { [key: string]: { sells: number; orders: number } } = {};

  orders.forEach((order) => {
    const date = format(new Date(order.createdAt), 'MMM d');
    if (!dailyData[date]) {
      dailyData[date] = { sells: 0, orders: 0 };
    }
    dailyData[date].sells += order.totalAmount;
    dailyData[date].orders += 1;
  });

  const sortedDates = Object.keys(dailyData).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return sortedDates.map((date) => ({
    name: date,
    Sells: parseFloat(dailyData[date].sells.toFixed(2)),
    Order: dailyData[date].orders,
  }));
}

async function LineChartContainer({ last = '7' }: LineChartContainerProps) {
  let orders: Order[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders?last=${last}`,
      {
        // --- 2. Add headers to forward authentication cookies ---
        headers: {
          Cookie: cookies().toString(),
        },
        // Prevent caching of dynamic data
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      orders = result.data;
    }
  } catch (error) {
    console.error('Failed to fetch chart data:', error);
  }

  if (orders.length > 0) {
    processedData = await processOrdersForChart(orders);
    currentPeriodSales = processedData.reduce((sum, data) => sum + data.Sells, 0);

    if (processedData.length >= 2) {
      const lastSales = processedData[processedData.length - 1].Sells;
      const secondLastSales = processedData[processedData.length - 2].Sells;
      if (secondLastSales > 0) {
        salesChange = ((lastSales - secondLastSales) / secondLastSales) * 100;
      }
    }
  }

  return (
    <LineChart
      chartData={processedData}
      totalSales={currentPeriodSales}
      salesChange={salesChange}
    />
  );
}

export default LineChartContainer;
export { processedData, currentPeriodSales, salesChange };
