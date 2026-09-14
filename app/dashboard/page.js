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

  const statusStyles = {
    Applied: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Interview: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Offer: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    if (res.ok) setJobs(data.jobs);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setResume(reader.result);
  };
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Job tracker</h1>
            <p className="text-slate-400 mt-1">{jobs.length} application{jobs.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 active:scale-95 transition shadow-lg shadow-indigo-900/30"
          >
            {showForm ? 'Cancel' : '+ New application'}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(counts).map(([label, count]) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{label}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap mb-6">
          <input
            type="text"
            placeholder="Search by company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white flex-1 min-w-[200px] outline-none focus:border-violet-500 transition placeholder:text-slate-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500 transition"
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
            className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-2xl mb-8 flex gap-3 flex-wrap items-center animate-[fadeIn_0.2s_ease]"
          >
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="p-3 rounded-xl bg-slate-800/80 text-white flex-1 min-w-[160px] outline-none border border-transparent focus:border-violet-500 transition placeholder:text-slate-500"
              required
            />
            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-3 rounded-xl bg-slate-800/80 text-white flex-1 min-w-[160px] outline-none border border-transparent focus:border-violet-500 transition placeholder:text-slate-500"
              required
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-3 rounded-xl bg-slate-800/80 text-white outline-none border border-transparent focus:border-violet-500 transition"
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
              className="p-3 rounded-xl bg-slate-800/80 text-white text-sm outline-none border border-transparent focus:border-violet-500 transition file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:text-sm"
            />
            <button
              type="submit"
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-violet-500 active:scale-95 transition"
            >
              Add
            </button>
          </form>
        )}

        {error && <p className="text-rose-400 mb-4">{error}</p>}

        {/* Job cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white/5 border border-white/10 backdrop-blur p-5 rounded-2xl hover:border-white/20 hover:bg-white/[0.07] transition group"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{job.company}</h2>
                  <p className="text-slate-400 text-sm">{job.role}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusStyles[job.status]}`}>
                  {job.status}
                </span>
              </div>

              <div className="flex gap-2 items-center mt-4 pt-4 border-t border-white/10">
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job._id, e.target.value)}
                  className="p-2 rounded-lg bg-slate-800/80 text-white text-sm flex-1 outline-none"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="text-rose-400 px-3 py-2 rounded-lg text-sm hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-slate-500 text-lg">No applications yet</p>
            <p className="text-slate-600 text-sm mt-1">Click "New application" to add your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}