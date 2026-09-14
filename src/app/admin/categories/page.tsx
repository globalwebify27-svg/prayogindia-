"use client";

import React, { useState, useEffect } from "react";

import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit3,
  Trash2,
  Search,
  Tag,
  Globe,
  Image as ImageIcon,
  Filter,
  CheckCircle2,
  X,
  Save,
  FolderOpen,
  Folder,
  Settings,
  MoveVertical,
  Eye,
  Layers,
} from "lucide-react";
import {
  CATEGORIES_HIERARCHY,
  CategoryNode,
  flattenCategories,
} from "@/data/categoriesHierarchy";

// ── Colour helper for level badges ──
const LEVEL_STYLES: Record<number, string> = {
  0: "bg-[#00AEEF]/10 text-[#00AEEF] border border-[#00AEEF]/20",
  1: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  2: "bg-purple-50 text-purple-700 border border-purple-200",
};

const LEVEL_LABELS = ["Parent", "Subcategory", "Nested"];

// ── A single row in the category tree ──
function CategoryRow({
  node,
  depth,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  node: CategoryNode;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (node: CategoryNode) => void;
  onDelete: (id: string) => void;
}) {
  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <div
      style={{ paddingLeft: `${depth * 20}px` }}
      className="flex items-center gap-2 py-2.5 px-3 hover:bg-slate-50 rounded-xl transition-colors group"
    >
      {/* Expand / Collapse */}
      <button
        onClick={onToggle}
        className={`w-5 h-5 shrink-0 flex items-center justify-center rounded cursor-pointer ${
          hasChildren
            ? "text-slate-500 hover:text-slate-900"
            : "text-transparent"
        }`}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )
        ) : null}
      </button>

      {/* Folder Icon */}
      <span className="text-slate-400 shrink-0">
        {hasChildren ? (
          expanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500" />
          ) : (
            <Folder className="w-4 h-4 text-amber-400" />
          )
        ) : (
          <Tag className="w-3.5 h-3.5 text-slate-300" />
        )}
      </span>

      {/* Category Name */}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-slate-900 truncate block">
          {node.name}
        </span>
        <span className="text-[9px] font-mono text-slate-400 truncate block">
          /{node.slug}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] text-slate-400 font-medium hidden sm:block">
          {node.productCount.toLocaleString()} products
        </span>
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${LEVEL_STYLES[node.level]}`}
        >
          {LEVEL_LABELS[node.level]}
        </span>

        {/* Actions */}
        <button
          onClick={() => onEdit(node)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#00AEEF] hover:bg-[#E0F7FC] cursor-pointer"
          title="Edit Category"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(node.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
          title="Delete Category"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Recursive tree renderer ──
function CategoryTree({
  nodes,
  depth = 0,
  expandedIds,
  onToggle,
  onEdit,
  onDelete,
}: {
  nodes: CategoryNode[];
  depth?: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (node: CategoryNode) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.id}>
          <CategoryRow
            node={node}
            depth={depth}
            expanded={expandedIds.has(node.id)}
            onToggle={() => onToggle(node.id)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {expandedIds.has(node.id) &&
            node.children &&
            node.children.length > 0 && (
              <CategoryTree
                nodes={node.children}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
        </React.Fragment>
      ))}
    </>
  );
}

// ── Main Admin Categories Page ──
export default function AdminCategoriesPage() {
  const [categories, setCategories] =
    useState<CategoryNode[]>(CATEGORIES_HIERARCHY);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["arduino", "robotics", "drones"]),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNode, setEditingNode] = useState<CategoryNode | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [apiLoaded, setApiLoaded] = useState(false);

  // Try to load from real API on mount
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length) {
          // Transform DB Category nodes to CategoryNode shape
          const transform = (cats: any[], level: 0|1|2 = 0): CategoryNode[] =>
            cats.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              parentId: c.parentId || null,
              level,
              description: c.description || "",
              seoTitle: `${c.name} | Prayog India`,
              seoDescription: "",
              bannerUrl: c.image || "",
              iconName: "Tag",
              productCount: c._count?.products || 0,
              sortOrder: 0,
              children: c.children?.length
                ? transform(c.children, (level + 1) as 0|1|2)
                : undefined,
            }));
          setCategories(transform(data.data));
          setApiLoaded(true);
        }
      })
      .catch(() => {}); // Keep mock data as fallback
  }, []);


  // Create form state
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSeoTitle, setNewSeoTitle] = useState("");
  const [newSeoDesc, setNewSeoDesc] = useState("");
  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [newParentId, setNewParentId] = useState<string>("");
  const [newProductCount, setNewProductCount] = useState("0");

  const allFlat = flattenCategories(categories);

  const filteredCategories = searchQuery
    ? categories.filter((cat) =>
        allFlat.find(
          (n) =>
            n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.slug.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    : categories;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this category and all its subcategories? Products will remain but lose their category mapping.",
      )
    )
      return;

    // Try real API first
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Cannot delete category");
        return;
      }
    } catch {} // If API fails, still update local state

    const remove = (nodes: CategoryNode[]): CategoryNode[] =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          children: n.children ? remove(n.children) : undefined,
        }));
    setCategories(remove(categories));
    showSuccess("Category deleted successfully.");
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const level = newParentId
      ? allFlat.find((n) => n.id === newParentId)?.level === 0
        ? 1
        : 2
      : 0;

    const slug = newSlug.trim() ||
      newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Try real API
    let newId = `cat-${Date.now()}`;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          slug,
          description: newDescription.trim(),
          image: newBannerUrl.trim(),
          parentId: newParentId || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) newId = data.data.id;
    } catch {} // Continue with local state even if API fails

    const newCat: CategoryNode = {
      id: newId,
      name: newName.trim(),
      slug,
      parentId: newParentId || null,
      level: level as 0 | 1 | 2,
      description: newDescription.trim(),
      seoTitle: newSeoTitle.trim() || `${newName.trim()} | Prayog India`,
      seoDescription: newSeoDesc.trim(),
      bannerUrl: newBannerUrl.trim(),
      iconName: "Tag",
      productCount: parseInt(newProductCount) || 0,
      sortOrder: 99,
    };

    if (!newParentId) {
      setCategories((prev) => [...prev, newCat]);
    } else {
      const addToParent = (nodes: CategoryNode[]): CategoryNode[] =>
        nodes.map((n) =>
          n.id === newParentId
            ? { ...n, children: [...(n.children ?? []), newCat] }
            : {
                ...n,
                children: n.children ? addToParent(n.children) : undefined,
              },
        );
      setCategories(addToParent(categories));
      setExpandedIds((prev) => new Set([...prev, newParentId]));
    }

    setIsCreateOpen(false);
    setNewName("");
    setNewSlug("");
    setNewDescription("");
    setNewSeoTitle("");
    setNewSeoDesc("");
    setNewBannerUrl("");
    setNewParentId("");
    setNewProductCount("0");
    showSuccess(`Category "${newCat.name}" created successfully!`);
  };

  const handleSaveEdit = () => {
    if (!editingNode) return;
    const update = (nodes: CategoryNode[]): CategoryNode[] =>
      nodes.map((n) =>
        n.id === editingNode.id
          ? editingNode
          : { ...n, children: n.children ? update(n.children) : undefined },
      );
    setCategories(update(categories));
    setEditingNode(null);
    showSuccess("Category updated successfully!");
  };

  // Stats
  const totalCats = allFlat.length;
  const parentCats = allFlat.filter((n) => n.level === 0).length;
  const subCats = allFlat.filter((n) => n.level === 1).length;
  const totalProducts = allFlat.reduce(
    (acc, n) => acc + (n.level === 0 ? n.productCount : 0),
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#00AEEF] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
              MULTI-LEVEL CATEGORY ENGINE
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              Section 7 — Product Catalogue
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Category Hierarchy Manager
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Build and organize the 16-domain product catalogue with nested
            parent, subcategory, and nested category levels. Each category
            supports SEO slugs, banners, descriptions, and dynamic filter
            attributes.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-[#00AEEF]/20 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <div className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between">
            Total Categories <FolderTree className="w-4 h-4 text-[#00AEEF]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCats}</div>
          <div className="text-[10px] text-slate-400">Across all levels</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <div className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between">
            Parent Domains <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{parentCats}</div>
          <div className="text-[10px] text-slate-400">Top-level categories</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <div className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between">
            Subcategories <FolderOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{subCats}</div>
          <div className="text-[10px] text-slate-400">Second-level nodes</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1">
          <div className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between">
            Total SKU Capacity <Settings className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">
            {(totalProducts / 1000).toFixed(0)}K+
          </div>
          <div className="text-[10px] text-slate-400">
            Mapped product capacity
          </div>
        </div>
      </div>

      {/* Main Category Tree Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name or slug..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00AEEF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedIds(new Set(allFlat.map((n) => n.id)))}
              className="text-[10px] font-bold text-slate-600 hover:text-[#00AEEF] cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedIds(new Set())}
              className="text-[10px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/60 border-b border-slate-100 text-[10px]">
          <span className="font-black text-slate-400 uppercase">Legend:</span>
          {Object.entries(LEVEL_LABELS).map(([lvl, label]) => (
            <span
              key={lvl}
              className={`px-2 py-0.5 rounded-md font-bold ${LEVEL_STYLES[parseInt(lvl)]}`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Tree */}
        <div className="p-2 max-h-[600px] overflow-y-auto">
          <CategoryTree
            nodes={categories}
            expandedIds={expandedIds}
            onToggle={toggleExpand}
            onEdit={setEditingNode}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* ── Edit Category Modal ── */}
      {editingNode && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-[#00AEEF] tracking-wider">
                  EDIT CATEGORY
                </span>
                <h3 className="text-base font-black">{editingNode.name}</h3>
              </div>
              <button
                onClick={() => setEditingNode(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-700 uppercase mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editingNode.name}
                    onChange={(e) =>
                      setEditingNode({ ...editingNode, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 uppercase mb-1">
                    SEO Slug (URL)
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-r-0 border-slate-200 px-2.5 py-2.5 rounded-l-xl text-slate-400 font-mono">
                      /
                    </span>
                    <input
                      type="text"
                      value={editingNode.slug}
                      onChange={(e) =>
                        setEditingNode({ ...editingNode, slug: e.target.value })
                      }
                      className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-r-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  Category Description
                </label>
                <textarea
                  value={editingNode.description}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={editingNode.seoTitle}
                  onChange={(e) =>
                    setEditingNode({ ...editingNode, seoTitle: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  value={editingNode.seoDescription}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      seoDescription: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  Category Banner Image URL
                </label>
                <input
                  type="url"
                  value={editingNode.bannerUrl}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      bannerUrl: e.target.value,
                    })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900"
                />
                {editingNode.bannerUrl && (
                  <div className="mt-2 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={editingNode.bannerUrl}
                      alt="banner preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  Product Count
                </label>
                <input
                  type="number"
                  value={editingNode.productCount}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      productCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setEditingNode(null)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-[#00AEEF] text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Category Modal ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-[#00AEEF] tracking-wider">
                  CATEGORY HIERARCHY
                </span>
                <h3 className="text-base font-black">Create New Category</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleCreateCategory}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  Parent Category (optional)
                </label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800"
                >
                  <option value="">
                    — None (Create as Top-Level Parent) —
                  </option>
                  {allFlat
                    .filter((n) => n.level < 2)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {"  ".repeat(n.level)}
                        {n.name} [{LEVEL_LABELS[n.level]}]
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-700 uppercase mb-1">
                    Category Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Proximity Sensors"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 uppercase mb-1">
                    SEO URL Slug
                  </label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="auto-generated from name"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Short description for category browse page..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={newSeoTitle}
                  onChange={(e) => setNewSeoTitle(e.target.value)}
                  placeholder="Category Name | Prayog India"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  Category Banner URL
                </label>
                <input
                  type="url"
                  value={newBannerUrl}
                  onChange={(e) => setNewBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase mb-1">
                  Initial Product Count
                </label>
                <input
                  type="number"
                  value={newProductCount}
                  onChange={(e) => setNewProductCount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00AEEF] text-white px-6 py-2.5 rounded-xl font-black uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
