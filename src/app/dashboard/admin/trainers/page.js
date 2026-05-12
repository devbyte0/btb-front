"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || [];

export default function AdminTrainersPage() {
  const { token, user } = useAuth();
  const [trainerForm, setTrainerForm] = useState({ name: "", username: "", password: "", email: "" });
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.listUsers(token);
      const users = unwrap(res);
      setTrainers(users.filter((user) => user.role === "trainer"));
      setStudents(users.filter((item) => item.role === "student"));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { Promise.resolve().then(() => loadUsers()); }, [loadUsers]);

  const handleCreateTrainer = async (event) => {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      await dashboardApi.createTrainer(token, trainerForm);
      setMessage("Trainer created successfully by admin.");
      setTrainerForm({ name: "", username: "", password: "", email: "" });
      await loadUsers();
    } catch (err) { setError(err.message); }
  };

  const handleToggleUser = async (targetUser) => {
    try {
      await dashboardApi.updateUser(token, targetUser._id, { isActive: !targetUser.isActive });
      setMessage("User status updated.");
      await loadUsers();
    } catch (err) { setError(err.message); }
  };

  const startEdit = (targetUser) => {
    setEditingUserId(targetUser._id);
    setEditForm({ name: targetUser.name || "", email: targetUser.email || "", phone: targetUser.phone || "" });
  };

  const saveEdit = async () => {
    try {
      await dashboardApi.updateUser(token, editingUserId, editForm);
      setEditingUserId("");
      setMessage("User updated.");
      await loadUsers();
    } catch (err) { setError(err.message); }
  };

  const removeUser = async (userId) => {
    try {
      await dashboardApi.deleteUser(token, userId);
      setMessage("User deleted.");
      await loadUsers();
    } catch (err) { setError(err.message); }
  };

  const visibleUsers = (user?.role === "trainer" ? students : trainers).filter((targetUser) =>
    `${targetUser.name} ${targetUser.username}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">{user?.role === "trainer" ? "Students & Profile Controls" : "Trainers"}</h1>
          <p className="mt-2 text-[#e6c6a5]">Manage users and training operations with role-based controls.</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-green-900/30 px-6 py-3 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-red-900/30 px-6 py-3 text-red-300">{error}</p></Reveal>}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {user?.role !== "trainer" ? (
            <Reveal variant="fade-left" delay={100}>
              <section className="section-card rounded-2xl p-5 md:p-6">
                <h2 className="text-2xl font-black text-[#fff0df]">Create Trainer</h2>
                <form className="mt-4 space-y-3" onSubmit={handleCreateTrainer}>
                  {["name", "username", "password", "email"].map((field) => (
                    <input key={field} required={field !== "email"} type={field === "password" ? "password" : "text"}
                      placeholder={field[0].toUpperCase() + field.slice(1)} value={trainerForm[field]}
                      onChange={(e) => setTrainerForm((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
                  ))}
                  <button className="btn-primary w-full rounded-xl px-4 py-2.5 font-semibold text-white">Create Trainer</button>
                </form>
              </section>
            </Reveal>
          ) : null}

          <Reveal variant="fade-right" delay={100}>
            <section className={`section-card rounded-2xl p-5 md:p-6 ${user?.role === "trainer" ? "md:col-span-2" : ""}`}>
              <h2 className="text-2xl font-black text-[#fff0df]">{user?.role === "trainer" ? "Student List" : "Trainer List"}</h2>
              <input placeholder={`Search ${user?.role === "trainer" ? "students" : "trainers"}`} value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-focus-ring mt-3 w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-2.5 text-[#ffe6cb] outline-none" />
              {loading ? <p className="mt-3 text-[#e6c6a5]">Loading...</p> : null}
              <div className="mt-4 space-y-2">
                {visibleUsers.map((targetUser, i) => (
                  <Reveal key={targetUser._id} delay={i * 30} variant="fade-up">
                    <article className="rounded-xl border border-white/10 bg-[#211309] p-3 transition-all duration-300 hover:border-[#f39b45]/30">
                      {editingUserId === targetUser._id ? (
                        <div className="space-y-2">
                          {["name", "email", "phone"].map((field) => (
                            <input key={field} value={editForm[field]}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }))}
                              className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" />
                          ))}
                          <button type="button" onClick={saveEdit} className="btn-primary w-full rounded-lg px-3 py-2 text-sm font-semibold text-white">Save</button>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-[#ffebd4]">{targetUser.name}</p>
                          <p className="text-sm text-[#e6c6a5]">@{targetUser.username}</p>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button type="button" onClick={() => startEdit(targetUser)}
                              className="rounded-lg border border-[#f6bf86] px-2 py-1 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Edit</button>
                            <button type="button" onClick={() => handleToggleUser(targetUser)}
                              className="rounded-lg border border-[#f6bf86] px-2 py-1 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">{targetUser.isActive ? "Deactivate" : "Activate"}</button>
                            <button type="button" onClick={() => removeUser(targetUser._id)}
                              className="rounded-lg border border-red-400/60 px-2 py-1 text-xs text-red-300 transition-all hover:bg-red-400/10">Delete</button>
                          </div>
                        </>
                      )}
                    </article>
                  </Reveal>
                ))}
                {!loading && visibleUsers.length === 0 ? <p className="text-sm text-[#e6c6a5]">No users found.</p> : null}
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </ProtectedRoute>
  );
}
