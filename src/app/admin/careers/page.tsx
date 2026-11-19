// src/app/admin/careers/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  MapPin,
  Clock,
  ToggleLeft,
  ToggleRight,
  Filter,
} from "lucide-react";
import { JobOpeningRecord } from "@/lib/careersStore";

const POPULAR_DEPARTMENTS = [
  "Lab Engineering & Installation",
  "Hardware R&D",
  "Flight Systems & Avionics",
  "Autonomous Systems & AI",
  "Mechanical Design & Prototyping",
  "Software & Embedded Systems",
  "Robotics Curriculum & Training",
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<JobOpeningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpeningRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("Bengaluru, Karnataka");
  const [type, setType] = useState("Full-time");
  const [experience, setExperience] = useState("1 - 3 Years");
  const [salaryRange, setSalaryRange] = useState("₹7.0 - 12 LPA");
  const [tagsInput, setTagsInput] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [responsibilitiesInput, setResponsibilitiesInput] = useState("");
  const [requirementsInput, setRequirementsInput] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const showNotification = (
    text: string,
    type: "success" | "error" = "success",
  ) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/careers");
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setJobs(json.data);
      }
    } catch (e) {
      console.error("Error loading careers jobs:", e);
      showNotification("Failed to load jobs list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle("");
    setSlug("");
    setDepartment(POPULAR_DEPARTMENTS[0]);
    setLocation("Bengaluru, Karnataka (On-site / Field)");
    setType("Full-time");
    setExperience("2 - 4 Years");
    setSalaryRange("₹8.0 - 14 LPA");
    setTagsInput("ROS2, Python, Hardware, Sensors");
    setShortDescription("");
    setResponsibilitiesInput(
      "Deploy and calibrate robotic systems.\nConduct training and test runs on physical hardware.\nCollaborate with engineering teams on firmware integration.",
    );
    setRequirementsInput(
      "Degree in Mechatronics, Robotics, Electrical or ECE.\nProficiency in Python/C++ and microcontroller platforms.\nHands-on maker experience.",
    );
    setIsActive(true);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobOpeningRecord) => {
    setEditingJob(job);
    setTitle(job.title);
    setSlug(job.slug);
    setDepartment(job.department);
    setLocation(job.location);
    setType(job.type);
    setExperience(job.experience);
    setSalaryRange(job.salaryRange || "");
    setTagsInput((job.tags || []).join(", "));
    setShortDescription(job.shortDescription);
    setResponsibilitiesInput((job.responsibilities || []).join("\n"));
    setRequirementsInput((job.requirements || []).join("\n"));
    setIsActive(job.isActive ?? true);
    setIsFeatured(Boolean(job.isFeatured));
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingJob) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !department.trim() || !shortDescription.trim()) {
      showNotification("Please fill in Title, Department and Short Description", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        id: editingJob ? editingJob.id : undefined,
        title: title.trim(),
        slug: slug.trim(),
        department: department.trim(),
        location: location.trim(),
        type: type.trim(),
        experience: experience.trim(),
        salaryRange: salaryRange.trim(),
        tags: tagsInput,
        shortDescription: shortDescription.trim(),
        responsibilities: responsibilitiesInput,
        requirements: requirementsInput,
        isActive,
        isFeatured,
      };

      const res = await fetch("/api/admin/careers", {
        method: editingJob ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showNotification(
          editingJob
            ? "Job opening updated successfully!"
            : "Job opening published successfully!",
        );
        setIsModalOpen(false);
        fetchJobs();
      } else {
        showNotification(json.message || "Operation failed", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showNotification("Failed to save job opening", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (job: JobOpeningRecord) => {
    try {
      const updatedStatus = !job.isActive;
      const res = await fetch("/api/admin/careers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, isActive: updatedStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification(
          `Job marked as ${updatedStatus ? "Active (Published)" : "Inactive (Draft)"}`,
        );
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, isActive: updatedStatus } : j,
          ),
        );
      } else {
        showNotification(json.message || "Failed to toggle status", "error");
      }
    } catch {
      showNotification("Network error while toggling status", "error");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/careers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showNotification("Job opening deleted successfully.");
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } else {
        showNotification(json.message || "Failed to delete job", "error");
      }
    } catch {
      showNotification("Network error while deleting job", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Distinct departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => set.add(j.department));
    return Array.from(set);
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status filter
      if (statusFilter === "ACTIVE" && !job.isActive) return false;
      if (statusFilter === "INACTIVE" && job.isActive) return false;

      // Department filter
      if (departmentFilter !== "ALL" && job.department !== departmentFilter)
        return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = job.title.toLowerCase().includes(q);
        const inDept = job.department.toLowerCase().includes(q);
        const inDesc = job.shortDescription.toLowerCase().includes(q);
        const inTags = job.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        return inTitle || inDept || inDesc || inTags;
      }

      return true;
    });
  }, [jobs, statusFilter, departmentFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Careers &amp; Job Openings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Publish, edit, and manage engineering and hardware job postings visible on the public website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/careers"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00AEEF] hover:bg-[#0096D6] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Positions
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {jobs.length}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Active / Live
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {jobs.filter((j) => j.isActive).length}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Departments
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {departmentsList.length}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            Featured Roles
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
            {jobs.filter((j) => j.isFeatured).length}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by title, skill, or department..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-9 py-2 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-emerald-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "INACTIVE"
                  ? "bg-white text-slate-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Drafts
            </button>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#00AEEF] cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table / List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#00AEEF] animate-spin" />
          <span className="text-xs font-bold">Loading careers job postings...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Job Postings Found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? "Try adjusting your search filters."
              : "Click 'Post New Job' to publish your first opening."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs ${
                job.isActive
                  ? "border-slate-200 hover:border-[#00AEEF]"
                  : "border-slate-200 bg-slate-50/60 opacity-80"
              }`}
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      job.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {job.isActive ? "Live / Active" : "Draft / Inactive"}
                  </span>

                  <span className="bg-sky-50 text-[#005CA9] border border-sky-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    {job.department}
                  </span>

                  {job.isFeatured && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      Featured
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    {job.title}
                    <span className="text-[11px] font-mono text-slate-400 font-normal">
                      ({job.slug})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {job.shortDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {job.experience} ({job.type})
                  </span>
                  {job.salaryRange && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {job.salaryRange}
                      </span>
                    </>
                  )}
                </div>

                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {job.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Active Toggle Button */}
                <button
                  onClick={() => handleToggleStatus(job)}
                  title={job.isActive ? "Unpublish Job" : "Publish Job"}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    job.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {job.isActive ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] hidden sm:inline">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px] hidden sm:inline">Draft</span>
                    </>
                  )}
                </button>

                {/* View on Public Site */}
                <Link
                  href={`/careers/${job.slug}`}
                  target="_blank"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="View Public Post"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(job)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-[#00AEEF] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeletingId(job.id)}
                  className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-black text-slate-900">
                Delete Job Opening?
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Are you sure you want to delete this job posting? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJob(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#00AEEF]/10 text-[#00AEEF]">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingJob ? "Edit Job Opening" : "Post New Job Opening"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingJob
                      ? "Update job details and requirements"
                      : "Create and publish a new engineering career opening"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveJob} className="space-y-4">
              {/* Job Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Robotics Field Application Engineer"
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                />
              </div>

              {/* Slug & Department Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. robotics-engineer"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Hardware R&D"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                  {/* Department suggestions */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {POPULAR_DEPARTMENTS.slice(0, 4).map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDepartment(d)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location, Type, Experience Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 2 - 4 Years"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                </div>
              </div>

              {/* Salary & Tags Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. ₹8.0 - 14 LPA"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tags / Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. ROS2, Python, C++, Sensors"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                  />
                </div>
              </div>

              {/* Short Summary Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description (Shown on Careers Cards) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Summary of the role in 1-2 sentences..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Responsibilities (One item per line)
                </label>
                <textarea
                  rows={3}
                  value={responsibilitiesInput}
                  onChange={(e) => setResponsibilitiesInput(e.target.value)}
                  placeholder="Install, calibrate, and verify ROS2 robot platforms.\nConduct workshops and faculty training sessions.\n..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requirements &amp; Qualifications (One item per line)
                </label>
                <textarea
                  rows={3}
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  placeholder="B.Tech / M.Tech in Mechatronics or Robotics.\nProficiency in C/C++, Python and ROS2.\n..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00AEEF] focus:bg-white"
                />
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00AEEF] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Live / Published
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00AEEF] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Featured Role
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00AEEF] hover:bg-[#0096D6] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingJob ? "Save Changes" : "Publish Job"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
