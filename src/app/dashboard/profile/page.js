"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

import Reveal from "@/components/Reveal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function ProfilePage() {
  const { user, token, logout, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", username: user?.username || "", phone: user?.phone || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user?.profilePic || null);

  useEffect(() => { setPreview(user?.profilePic || null); }, [user?.profilePic]);

  const handleSave = async (e) => {
    e.preventDefault(); setMessage(""); setError(""); setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile/update`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setMessage("Profile updated!");
      refreshUser();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setMessage(""); setError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setError("Passwords don't match"); return; }
    if (passwordForm.newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile/update`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMessage("Password changed!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    setUploading(true); setError("");
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`${API_BASE}/uploads`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");

      const picUrl = uploadData.data?.url || uploadData.url;
      const res = await fetch(`${API_BASE}/users/profile/update`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profilePic: picUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile pic");
      setMessage("Profile picture updated!");
      refreshUser();
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  return (
    <ProtectedRoute>
      <div className="page-enter mx-auto w-full max-w-2xl px-4 py-8 md:px-8 md:py-12">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">Profile Settings</h1>
          <p className="mt-2 text-[#e6c6a5]">Manage your account details, profile picture, and password.</p>
        </Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-green-900/30 px-6 py-3 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-red-900/30 px-6 py-3 text-red-300">{error}</p></Reveal>}

        {/* Profile Picture */}
        <Reveal variant="fade-up" delay={50}>
          <section className="section-card mt-8 rounded-2xl p-6">
            <h2 className="text-xl font-black text-[#fff0df]">Profile Picture</h2>
            <div className="mt-4 flex items-center gap-6">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-[#211309]">
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-[#e6c6a5]">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div>
                <label className="btn-primary inline-block cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
                  {uploading ? "Uploading..." : "Upload Photo"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                <p className="mt-1 text-xs text-[#e6c6a5]">JPG, PNG, GIF. Max 2MB.</p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Profile Info */}
        <Reveal variant="fade-up" delay={80}>
          <section className="section-card mt-6 rounded-2xl p-6">
            <h2 className="text-xl font-black text-[#fff0df]">Personal Info</h2>
            <form className="mt-4 space-y-4" onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Name</label>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Username</label>
                  <input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Email</label>
                  <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full rounded-xl py-3 font-semibold text-white disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </Reveal>

        {/* Password Change */}
        <Reveal variant="fade-up" delay={110}>
          <section className="section-card mt-6 rounded-2xl p-6">
            <h2 className="text-xl font-black text-[#fff0df]">Change Password</h2>
            <form className="mt-4 space-y-4" onSubmit={handlePasswordChange}>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">New Password</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required minLength={6} />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Confirm Password</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required minLength={6} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full rounded-xl py-3 font-semibold text-white disabled:opacity-60">
                {saving ? "Updating..." : "Change Password"}
              </button>
            </form>
          </section>
        </Reveal>
      </div>
    </ProtectedRoute>
  );
}
