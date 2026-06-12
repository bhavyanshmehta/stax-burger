import fs from "fs/promises";
import path from "path";

// In-memory array for Vercel read-only serverless environment
let inMemoryOrders = [];

const dataDir = path.join(process.cwd(), "src", "data");
const filePath = path.join(dataDir, "orders.json");

async function ensureFileExists() {
  if (process.env.VERCEL) return; // Skip filesystem in Vercel
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(filePath);
  } catch (error) {
    await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf8");
  }
}

export async function getOrders() {
  if (process.env.VERCEL) {
    return inMemoryOrders;
  }

  await ensureFileExists();
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading fallback orders database file:", error);
    return [];
  }
}

export async function saveOrders(orders) {
  if (process.env.VERCEL) {
    inMemoryOrders = orders;
    return true;
  }

  await ensureFileExists();
  try {
    await fs.writeFile(filePath, JSON.stringify(orders, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing fallback orders database file:", error);
    return false;
  }
}

export async function createOrder(orderData) {
  const orders = await getOrders();
  
  const formattedItems = orderData.items.map(item => ({
    name: item.name,
    price: item.price,
    qty: item.qty,
    image: item.image
  }));

  const newOrder = {
    _id: "stx_" + Math.random().toString(36).substr(2, 9),
    profileId: orderData.profileId || null,
    name: orderData.name,
    email: orderData.email,
    phone: orderData.phone,
    address: orderData.address,
    items: formattedItems,
    subtotal: parseInt(orderData.subtotal),
    tax: parseInt(orderData.tax),
    total: parseInt(orderData.total),
    status: orderData.status || "Received",
    estimatedTime: orderData.estimatedTime || "30 mins",
    paymentMethod: orderData.paymentMethod || "COD",
    paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === "COD" ? "COD" : "Pending"),
    transactionId: orderData.transactionId || null,
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  await saveOrders(orders);
  return newOrder;
}

export async function getOrderById(id) {
  const orders = await getOrders();
  return orders.find(order => order._id === id) || null;
}

export async function updateOrderDetails(id, updateFields) {
  const orders = await getOrders();
  const index = orders.findIndex(order => order._id === id);
  if (index === -1) return null;
  
  // Merge updates
  orders[index] = { ...orders[index], ...updateFields };
  
  await saveOrders(orders);
  return orders[index];
}
