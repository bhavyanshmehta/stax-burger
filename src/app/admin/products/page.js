"use client";

import React, { useState, useContext } from "react";
import { AdminContext } from "../layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ToggleRight, 
  ToggleLeft, 
  Upload, 
  X 
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AdminProductsPage() {
  const { 
    products, 
    menuLoading, 
    fetchProducts, 
    handleDeleteProduct, 
    handleToggleProductAvailability 
  } = useContext(AdminContext);

  // Product Form states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodCategory, setProdCategory] = useState("signature");
  const [prodVegType, setProdVegType] = useState("veg");
  const [prodAvailability, setProdAvailability] = useState(true);
  const [prodTag, setProdTag] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setProdName(product.name);
      setProdDesc(product.description || "");
      setProdPrice(product.price.toString());
      setProdImage(product.image);
      setProdCategory(product.category);
      setProdVegType(product.veg_type || "veg");
      setProdAvailability(product.availability);
      setProdTag(product.tag || "");
    } else {
      setProdName("");
      setProdDesc("");
      setProdPrice("");
      setProdImage("");
      setProdCategory("signature");
      setProdVegType("veg");
      setProdAvailability(true);
      setProdTag("");
    }
    setIsProductModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Upload to product-images Supabase Storage Bucket
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (error) throw error;

        // Retrieve public URL
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        setProdImage(urlData.publicUrl);
      } catch (err) {
        console.error("Storage upload failed:", err);
        alert("Failed to upload image. Make sure 'product-images' bucket is created and set to public read.");
      } finally {
        setUploadingImage(false);
      }
    } else {
      // Simulation Mock Upload
      setTimeout(() => {
        setProdImage("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop");
        setUploadingImage(false);
      }, 1000);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim() || !prodImage.trim()) {
      alert("Name, Price, and Product Image are required.");
      return;
    }

    const priceNum = parseInt(prodPrice);
    if (isNaN(priceNum)) {
      alert("Price must be a valid number.");
      return;
    }

    const hasKeys = isSupabaseConfigured();
    const productPayload = {
      name: prodName,
      description: prodDesc,
      price: priceNum,
      image: prodImage,
      category: prodCategory,
      veg_type: prodVegType,
      availability: prodAvailability,
      tag: prodTag || null,
      is_new: editingProduct ? editingProduct.is_new : true
    };

    try {
      if (hasKeys) {
        if (editingProduct) {
          // Update product in Supabase
          const { error } = await supabase
            .from("products")
            .update(productPayload)
            .eq("id", editingProduct.id);
          if (error) throw error;
        } else {
          // Insert new product in Supabase
          const { error } = await supabase
            .from("products")
            .insert(productPayload);
          if (error) throw error;
        }
      } else {
        // Mock CRUD locally
        let updatedProducts = [...products];
        if (editingProduct) {
          updatedProducts = updatedProducts.map(p => 
            p.id === editingProduct.id ? { ...p, ...productPayload } : p
          );
        } else {
          const newProd = {
            id: Date.now(),
            ...productPayload,
          };
          updatedProducts.unshift(newProd);
        }
        localStorage.setItem("stax_sim_products", JSON.stringify(updatedProducts));
      }

      await fetchProducts();
      setIsProductModalOpen(false);
    } catch (err) {
      console.error("Save product error:", err);
      alert("Error saving product: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="font-heading font-black text-base uppercase tracking-wider text-white m-0">
          Live Products Inventory
        </h3>
        <button
          onClick={() => handleOpenProductModal(null)}
          className="flex items-center gap-2 bg-[#FF7A00]/10 hover:bg-[#FF7A00] border border-[#FF7A00]/30 text-[#FF7A00] hover:text-black font-heading font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-full transition-all duration-300 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {menuLoading ? (
        <div className="py-16 text-center text-white/35 font-bold text-xs uppercase tracking-widest">
          Fetching catalog inventory...
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-5 flex gap-4 shadow-lg hover:border-white/10 transition-colors duration-300">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/15 p-2 flex items-center justify-center flex-shrink-0">
                <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
              </div>

              <div className="flex-1 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-black text-sm text-white uppercase tracking-wider line-clamp-1">{prod.name}</span>
                    <span className={`text-[8px] font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 ${
                      prod.veg_type === "veg" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {prod.veg_type || "veg"}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2 mt-1 mb-0">{prod.description || "No description provided."}</p>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Price</span>
                    <span className="font-heading font-black text-sm text-[#FF7A00]">₹{prod.price}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Availability Toggle */}
                    <button
                      onClick={() => handleToggleProductAvailability(prod)}
                      className="bg-transparent border-none text-white/40 hover:text-white p-1 cursor-pointer transition-colors"
                      title={prod.availability ? "Disable availability" : "Enable availability"}
                    >
                      {prod.availability ? (
                        <div className="flex items-center gap-1.5 text-green-400 text-[9px] uppercase font-bold">
                          <ToggleRight className="w-6 h-6" /> Available
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-white/30 text-[9px] uppercase font-bold">
                          <ToggleLeft className="w-6 h-6" /> Out of stock
                        </div>
                      )}
                    </button>

                    <div className="h-4 w-px bg-white/5" />

                    <button
                      onClick={() => handleOpenProductModal(prod)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#FF7A00]/50 hover:bg-[#FF7A00]/10 flex items-center justify-center text-white/50 hover:text-[#FF7A00] cursor-pointer transition-all duration-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 flex items-center justify-center text-white/50 hover:text-red-400 cursor-pointer transition-all duration-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">No products found in database.</p>
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-[12px]"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 text-white z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-black text-lg uppercase tracking-wider text-[#FF7A00] m-0">
                  {editingProduct ? "Edit Menu Product" : "Add New Menu Product"}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4 text-left">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Smoky Chipotle Crunch Stack"
                    className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Description</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Premium patty smothered with glossy chipotle sauce, swiss slices..."
                    rows="2"
                    className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Price (₹ INR)</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="299"
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Category</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="signature">Signature Stacks</option>
                      <option value="chicken">Chicken Stacks</option>
                      <option value="veg">Veg Stacks</option>
                      <option value="sides">Sides & Extras</option>
                      <option value="drinks">Beverages</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Veg/Dietary Type</label>
                    <select
                      value={prodVegType}
                      onChange={(e) => setProdVegType(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="veg">Vegetarian (Veg)</option>
                      <option value="non-veg">Non-Vegetarian (Non-Veg)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Catalog Tag</label>
                    <input
                      type="text"
                      value={prodTag}
                      onChange={(e) => setProdTag(e.target.value)}
                      placeholder="e.g. Chef Choice, Fire Sizzled"
                      className="w-full bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Image upload and url field */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Product Asset Image</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="Paste image URL directly..."
                      className="flex-1 bg-[#121212] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-white text-xs outline-none"
                    />
                    <label className="bg-white/5 hover:bg-white/10 border border-white/15 px-4 py-3 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingImage ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="prod_availability"
                    checked={prodAvailability}
                    onChange={(e) => setProdAvailability(e.target.checked)}
                    className="w-4 h-4 accent-[#FF7A00] cursor-pointer"
                  />
                  <label htmlFor="prod_availability" className="text-xs text-white/70 font-semibold cursor-pointer">Available and active in menu</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-[#FFB347] hover:scale-102 text-black font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_25px_rgba(255,122,0,0.3)] transition-all duration-300 border-none cursor-pointer mt-4"
                >
                  {editingProduct ? "Save Product Settings" : "Add Product to Catalog"}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
