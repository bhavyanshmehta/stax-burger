import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
    }
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Received", "Cooking", "Out for Delivery", "Delivered"],
    default: "Received",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
