'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [resume, setResume] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const statusStyles = {
    Applied: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Interview: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Offer: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const statusDot = {
    Applied: 'bg-amber-400',
    Interview: 'bg-sky-400',
    Offer: 'bg-emerald-400',
    Rejected: 'bg-rose-400',
  };

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    if (res.ok) setJobs(data.jobs);
    setLoaded(true);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setResume(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, role, status, resume }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    setCompany('');
    setRole('');
    setStatus('Applied');
    setResume(null);
    setShowForm(false);
    fetchJobs();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    fetchJobs();
  };

  const handleStatusChange = async (id, newStatus) => {
    await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchJobs();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    Applied: jobs.filter((j) => j.status === 'Applied').length,
    Interview: jobs.filter((j) => j.status === 'Interview').length,
    Offer: jobs.filter((j) => j.status === 'Offer').length,
    Rejected: jobs.filter((j) => j.status === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1e1b3a_0%,_#0a0a14_55%)] p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-violet-400 text-xs font-semibold tracking-widest uppercase mb-1">
              Dashboard
            </p>
            <h1 className="text-4xl font-bold text-white tracking-tight">Job tracker</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {jobs.length} application{jobs.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-3 rounded-xl font-medium hover:brightness-110 active:scale-95 transition-all duration-150 shadow-lg shadow-violet-900/40"
          >
            {showForm ? 'Cancel' : '+ New application'}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(counts).map(([label, count]) => (
            <div
              key={label}
              className="relative overflow-hidden bg-white/[0.04] border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.06] transition-colors duration-200"
            >
              <div className={`absolute top-0 left-0 h-1 w-full ${statusDot[label]} opacity-70`} />
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[label]}`} />
                {label}
              </p>
              <p className="text-3xl font-bold text-white tabular-nums">{count}</p>
            </div>
          ))}
        </div>

        {/* Search and filter */}
        <div className="flex gap-3 flex-wrap mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-4 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-violet-500 focus:bg-white/[0.06] transition-all duration-200 placeholder:text-slate-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none focus:border-violet-500 transition-all duration-200 cursor-pointer"
          >
            <option value="All">All statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Add form (collapsible) */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="bg-white/[0.04] border border-violet-500/20 backdrop-blur p-6 rounded-2xl mb-8 flex gap-3 flex-wrap items-center animate-[fadeIn_0.25s_ease]"
          >
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="p-3 rounded-xl bg-slate-900/60 text-white flex-1 min-w-[160px] outline-none border border-white/10 focus:border-violet-500 transition-all duration-200 placeholder:text-slate-500"
              required
            />
            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-3 rounded-xl bg-slate-900/60 text-white flex-1 min-w-[160px] outline-none border border-white/10 focus:border-violet-500 transition-all duration-200 placeholder:text-slate-500"
              required
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-3 rounded-xl bg-slate-900/60 text-white outline-none border border-white/10 focus:border-violet-500 transition-all duration-200 cursor-pointer"
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="p-2.5 rounded-xl bg-slate-900/60 text-white text-sm outline-none border border-white/10 focus:border-violet-500 transition-all duration-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:text-xs file:font-medium file:cursor-pointer"
            />
            <button
              type="submit"
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-violet-500 active:scale-95 transition-all duration-150"
            >
              Add
            </button>
          </form>
        )}

        {error && (
          <p className="text-rose-400 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm">
            {error}
          </p>
        )}

        {/* Job cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job, i) => (
            <div
              key={job._id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-[fadeIn_0.3s_ease_both] bg-white/[0.04] border border-white/10 backdrop-blur p-5 rounded-2xl hover:border-violet-500/30 hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{job.company}</h2>
                  <p className="text-slate-400 text-sm">{job.role}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border whitespace-nowrap ${statusStyles[job.status]}`}>
                  {job.status}
                </span>
              </div>

              <div className="flex gap-2 items-center mt-4 pt-4 border-t border-white/10">
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job._id, e.target.value)}
                  className="p-2 rounded-lg bg-slate-900/60 text-white text-sm flex-1 outline-none cursor-pointer border border-transparent hover:border-white/10 transition-colors"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="text-rose-400 px-3 py-2 rounded-lg text-sm hover:bg-rose-500/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {loaded && filteredJobs.length === 0 && (
          <div className="text-center mt-20 animate-[fadeIn_0.3s_ease]">
            <p className="text-slate-500 text-lg">
              {jobs.length === 0 ? 'No applications yet' : 'No matches found'}
            </p>
            <p className="text-slate-600 text-sm mt-1">
              {jobs.length === 0
                ? 'Click "New application" to add your first one.'
                : 'Try a different search or filter.'}
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}