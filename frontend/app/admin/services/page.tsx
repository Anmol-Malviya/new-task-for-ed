"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Search, Edit2, Trash2, RefreshCw } from "lucide-react";
import {
  fetchAdminServices,
  deleteAdminService,
  createAdminService,
  updateAdminService,
} from "@/lib/adminApi";

interface Service {
  services_id: number;
  name: string;
  price: number;
  stock_status: string;
  category_name: string;
  vendor_id: number;
  vendor_name: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_name: "",
    stock_status: "in_stock",
  });

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminServices();
      setServices(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      services.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.category_name?.toLowerCase().includes(q) ||
          s.vendor_name?.toLowerCase().includes(q)
      )
    );
  }, [search, services]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteAdminService(id);
      setServices((prev) => prev.filter((s) => s.services_id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete service");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      price: service.price?.toString() || "",
      category_name: service.category_name || "",
      stock_status: service.stock_status || "in_stock",
    });
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingService(null);
    setFormData({
      name: "",
      price: "",
      category_name: "",
      stock_status: "in_stock",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
      };

      if (editingService) {
        await updateAdminService(editingService.services_id, payload);
      } else {
        await createAdminService(payload);
      }
      setModalOpen(false);
      loadServices();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-400" />
            Service / Product Management
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            {loading ? "Loading..." : `${services.length} services available on the platform`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadServices}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or vendor..."
              className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 text-sm">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Service Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-slate-800 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No services found. Add one to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((service) => (
                  <tr
                    key={service.services_id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs text-indigo-300">
                      SRV-{service.services_id}
                    </td>
                    <td className="p-4 font-medium text-slate-200">
                      {service.name}
                    </td>
                    <td className="p-4 text-slate-400">
                      {service.category_name || "—"}
                    </td>
                    <td className="p-4 text-slate-400">
                      {service.vendor_name || "Admin / Global"}
                    </td>
                    <td className="p-4 font-bold text-white">
                      ₹{service.price}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          service.stock_status === "in_stock"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {service.stock_status === "in_stock" ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-slate-400 hover:text-indigo-400 p-2 transition-colors inline-block"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.services_id)}
                        className="text-slate-400 hover:text-rose-400 p-2 transition-colors inline-block ml-2"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingService ? "Edit Service" : "Add New Service"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Premium Wedding Decor"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.stock_status}
                    onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Photography, Decoration..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
                >
                  {editingService ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
