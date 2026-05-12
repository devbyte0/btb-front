"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSectionNav from "@/components/AdminSectionNav";
import { useAuth } from "@/context/AuthContext";
import { aboutUsApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || res;

const mediaTypes = [
  { type: "youtube", label: "YouTube", color: "text-red-400 bg-red-400/10" },
  { type: "facebook", label: "Facebook Post", color: "text-blue-400 bg-blue-400/10" },
  { type: "instagram", label: "Instagram", color: "text-pink-400 bg-pink-400/10" },
  { type: "twitter", label: "X / Twitter", color: "text-sky-400 bg-sky-400/10" },
  { type: "tiktok", label: "TikTok", color: "text-cyan-400 bg-cyan-400/10" },
  { type: "vimeo", label: "Vimeo", color: "text-teal-400 bg-teal-400/10" },
  { type: "image", label: "Image", color: "text-green-400 bg-green-400/10" },
  { type: "video", label: "Video File", color: "text-yellow-400 bg-yellow-400/10" },
  { type: "embed", label: "Embedded Page", color: "text-purple-400 bg-purple-400/10" },
  { type: "link", label: "Link", color: "text-gray-400 bg-gray-400/10" },
];

export default function AdminAboutUsPage() {
  const { token } = useAuth();
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({ heroTitle: "", heroSubtitle: "", story: "", mission: "", vision: "" });

  // Add media
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");

  // Edit media
  const [editMediaId, setEditMediaId] = useState(null);
  const [editMediaUrl, setEditMediaUrl] = useState("");
  const [editMediaTitle, setEditMediaTitle] = useState("");

  // Video collage
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [editVideoId, setEditVideoId] = useState(null);
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVideoTitle, setEditVideoTitle] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await aboutUsApi.get();
        if (!mounted) return;
        const data = unwrap(res);
        setAbout(data);
        setForm({
          heroTitle: data.heroTitle || "", heroSubtitle: data.heroSubtitle || "",
          story: data.story || "", mission: data.mission || "", vision: data.vision || "",
        });
      } catch (err) { if (mounted) setError(err.message); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSaveContent = async (e) => {
    e.preventDefault(); setMessage(""); setError("");
    try { const res = await aboutUsApi.update(token, form); setAbout(unwrap(res)); setMessage("Content saved!"); }
    catch (err) { setError(err.message); }
  };

  const handleAddMedia = async (e) => {
    e.preventDefault(); if (!mediaUrl) return;
    setMessage(""); setError("");
    try { const res = await aboutUsApi.addMedia(token, { url: mediaUrl, title: mediaTitle }); setAbout(unwrap(res)); setMediaUrl(""); setMediaTitle(""); setMessage("Media added!"); }
    catch (err) { setError(err.message); }
  };

  const handleRemoveMedia = async (mediaId) => {
    if (!confirm("Remove this media item?")) return;
    setMessage(""); setError("");
    try { const res = await aboutUsApi.removeMedia(token, mediaId); setAbout(unwrap(res)); setMessage("Media removed."); }
    catch (err) { setError(err.message); }
  };

  const handleEditMedia = async (e) => {
    e.preventDefault(); if (!editMediaId) return;
    setMessage(""); setError("");
    try {
      const res = await aboutUsApi.updateMedia(token, editMediaId, { url: editMediaUrl, title: editMediaTitle });
      setAbout(unwrap(res)); setEditMediaId(null); setEditMediaUrl(""); setEditMediaTitle(""); setMessage("Media updated!");
    } catch (err) { setError(err.message); }
  };

  const startEdit = (item) => {
    setEditMediaId(item._id); setEditMediaUrl(item.url); setEditMediaTitle(item.title || "");
  };

  const cancelEdit = () => { setEditMediaId(null); setEditMediaUrl(""); setEditMediaTitle(""); };

  const handleAddVideo = async (e) => {
    e.preventDefault(); if (!videoUrl) return;
    setMessage(""); setError("");
    try { const res = await aboutUsApi.addVideo(token, { url: videoUrl, title: videoTitle }); setAbout(unwrap(res)); setVideoUrl(""); setVideoTitle(""); setMessage("Video added to collage!"); }
    catch (err) { setError(err.message); }
  };

  const handleEditVideo = async (e) => {
    e.preventDefault(); if (!editVideoId) return;
    setMessage(""); setError("");
    try { const res = await aboutUsApi.updateVideo(token, editVideoId, { url: editVideoUrl, title: editVideoTitle }); setAbout(unwrap(res)); setEditVideoId(null); setMessage("Video updated!"); }
    catch (err) { setError(err.message); }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!confirm("Remove this video?")) return;
    setMessage(""); setError("");
    try { const res = await aboutUsApi.removeVideo(token, videoId); setAbout(unwrap(res)); setMessage("Video removed."); }
    catch (err) { setError(err.message); }
  };

  return (
    <ProtectedRoute roles={["trainer", "admin", "super_admin"]}>
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Reveal variant="fade-up">
          <h1 className="text-3xl font-black text-[#fff0df]">About Us Manager</h1>
          <p className="mt-2 text-[#e6c6a5]">Manage page content, Facebook posts, videos, and images.</p>
        </Reveal>
        <Reveal variant="fade-up" delay={50}><AdminSectionNav /></Reveal>

        {message && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-green-900/30 px-6 py-3 text-green-300">{message}</p></Reveal>}
        {error && <Reveal variant="fade-up"><p className="mt-4 rounded-2xl bg-red-900/30 px-6 py-3 text-red-300">{error}</p></Reveal>}

        {loading ? (
          <div className="mt-8 space-y-4"><div className="section-card rounded-2xl p-6"><div className="skeleton h-96 w-full" /></div></div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Reveal variant="fade-left" delay={100}>
              <section className="section-card rounded-2xl p-6">
                <h2 className="text-2xl font-black text-[#fff0df]">Content</h2>
                <form className="mt-6 space-y-4" onSubmit={handleSaveContent}>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Hero Title</label>
                    <input value={form.heroTitle} onChange={(e) => setForm((p) => ({ ...p, heroTitle: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Hero Subtitle</label>
                    <input value={form.heroSubtitle} onChange={(e) => setForm((p) => ({ ...p, heroSubtitle: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Our Story</label>
                    <textarea rows={5} value={form.story} onChange={(e) => setForm((p) => ({ ...p, story: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Mission</label>
                    <textarea rows={3} value={form.mission} onChange={(e) => setForm((p) => ({ ...p, mission: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Vision</label>
                    <textarea rows={3} value={form.vision} onChange={(e) => setForm((p) => ({ ...p, vision: e.target.value }))}
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                  </div>
                  <button type="submit" className="btn-primary w-full rounded-xl py-3 font-semibold text-white">Save Content</button>
                </form>
              </section>
            </Reveal>

            <div className="space-y-6">
              <Reveal variant="fade-right" delay={100}>
                <section className="section-card rounded-2xl p-6">
                  <h2 className="text-2xl font-black text-[#fff0df]">Add Media</h2>
                  <p className="mt-1 text-xs text-[#e6c6a5]">Paste any URL — YouTube, Facebook, Instagram, X/Twitter, TikTok, Vimeo, image, video, or any webpage. Everything embeds as an iframe.</p>
                  <form className="mt-4 space-y-4" onSubmit={handleAddMedia}>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">URL</label>
                      <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://facebook.com/YourPage/posts/... or any URL"
                        className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-widest text-[#e6c6a5]">Title / Caption</label>
                      <input value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)}
                        placeholder="Optional title"
                        className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                    </div>
                    <button type="submit" className="btn-primary w-full rounded-xl py-3 font-semibold text-white">Add Media</button>
                  </form>
                </section>
              </Reveal>

              <Reveal variant="fade-right" delay={150}>
                <section className="section-card rounded-2xl p-6">
                  <h2 className="text-2xl font-black text-[#fff0df]">Media Gallery ({about?.mediaGallery?.length || 0})</h2>
                  <p className="mt-1 text-xs text-[#e6c6a5]">Click Edit to change URL or title. Delete to remove.</p>
                  {!about?.mediaGallery?.length ? (
                    <p className="mt-4 text-[#e6c6a5]">No media yet. Add Facebook posts, videos, or images.</p>
                  ) : (
                    <div className="mt-4 space-y-3 max-h-[500px] overflow-auto">
                      {about.mediaGallery.map((item, i) => {
                        const t = mediaTypes.find((m) => m.type === item.type) || mediaTypes[3];
                        return (
                          <div key={item._id} className="rounded-xl border border-white/10 bg-[#211309] p-3">
                            {editMediaId === item._id ? (
                              <form onSubmit={handleEditMedia} className="space-y-2">
                                <input value={editMediaUrl} onChange={(e) => setEditMediaUrl(e.target.value)}
                                  className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" required />
                                <input value={editMediaTitle} onChange={(e) => setEditMediaTitle(e.target.value)}
                                  className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" placeholder="Title" />
                                <div className="flex gap-2">
                                  <button type="submit" className="btn-primary flex-1 rounded-lg py-1.5 text-xs font-semibold text-white">Save</button>
                                  <button type="button" onClick={cancelEdit} className="flex-1 rounded-lg border border-white/20 py-1.5 text-xs text-[#e6c6a5]">Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-[#ffebd4]">{item.title || "Untitled"}</p>
                                    <p className="truncate text-xs text-[#e6c6a5]">{item.url}</p>
                                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.color}`}>{t.label}</span>
                                  </div>
                                  {item.embedUrl && item.type === "youtube" && (
                                    <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                                      <iframe src={item.embedUrl} className="h-full w-full" title="" />
                                    </div>
                                  )}
                                  {item.embedUrl && item.type === "facebook" && (
                                    <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-blue-900/20 flex items-center justify-center text-blue-400 text-xs">FB Post</div>
                                  )}
                                  {item.type === "image" && (
                                    <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-[#1a1008]">
                                      <img src={item.url} alt="" className="h-full w-full object-contain" onError={(e) => { e.target.style.display = "none"; }} />
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <button onClick={() => startEdit(item)} className="flex-1 rounded-lg border border-[#f6bf86] py-1.5 text-xs text-[#ffe4c4] transition-all hover:bg-[#f6bf86]/10">Edit</button>
                                  <button onClick={() => handleRemoveMedia(item._id)} className="flex-1 rounded-lg border border-red-300 py-1.5 text-xs text-red-200 transition-all hover:bg-red-300/10">Delete</button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </Reveal>

              <Reveal variant="fade-right" delay={200}>
                <section className="section-card rounded-2xl p-6">
                  <h2 className="text-2xl font-black text-[#fff0df]">Homepage Video Collage</h2>
                  <p className="mt-1 text-xs text-[#e6c6a5]">Videos auto-play with sound. Paste YouTube or Facebook links.</p>
                  <form className="mt-4 space-y-3" onSubmit={handleAddVideo}>
                    <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or Facebook video URL"
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" required />
                    <input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="input-focus-ring w-full rounded-xl border border-white/15 bg-[#211309] px-4 py-3 text-[#ffe6cb]" />
                    <button type="submit" className="btn-primary w-full rounded-xl py-3 font-semibold text-white">Add to Video Collage</button>
                  </form>

                  {about?.videoCollage?.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {about.videoCollage.map((item, i) => (
                        <div key={item._id} className="rounded-xl border border-white/10 bg-[#211309] p-3">
                          {editVideoId === item._id ? (
                            <form onSubmit={handleEditVideo} className="space-y-2">
                              <input value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)}
                                className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" required />
                              <input value={editVideoTitle} onChange={(e) => setEditVideoTitle(e.target.value)}
                                className="input-focus-ring w-full rounded-lg border border-white/15 bg-[#2a170d] px-3 py-2 text-sm text-[#ffe6cb]" />
                              <div className="flex gap-2">
                                <button type="submit" className="btn-primary flex-1 rounded-lg py-1.5 text-xs text-white">Save</button>
                                <button type="button" onClick={() => setEditVideoId(null)} className="flex-1 rounded-lg border border-white/20 py-1.5 text-xs text-[#e6c6a5]">Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[#ffebd4]">{item.title || "Untitled"}</p>
                                <p className="truncate text-xs text-[#e6c6a5]">{item.type} • {item.url}</p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button onClick={() => { setEditVideoId(item._id); setEditVideoUrl(item.url); setEditVideoTitle(item.title || ""); }}
                                  className="rounded-lg border border-[#f6bf86] px-2 py-1 text-xs text-[#ffe4c4]">Edit</button>
                                <button onClick={() => handleRemoveVideo(item._id)}
                                  className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-200">Remove</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
