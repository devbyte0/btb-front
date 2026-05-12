"use client";

import { useEffect, useState } from "react";
import { aboutUsApi } from "@/lib/api";
import Reveal from "@/components/Reveal";

const unwrap = (res) => res?.data || res;

function MediaEmbed({ item }) {
  if (!item) return null;

  const Card = ({ children, addOnClick = false }) => {
    const cls = "overflow-hidden rounded-2xl border border-[#1c1c1e]/6 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer";
    if (addOnClick && item.url) {
      return <a href={item.url} target="_blank" rel="noopener noreferrer" className={`block ${cls}`}>{children}</a>;
    }
    return <div className={cls}>{children}</div>;
  };

  const titleBlock = item.title ? <div className="p-4 border-t border-[#1c1c1e]/6"><p className="font-semibold">{item.title}</p></div> : null;

  if (item.embedUrl && item.type === "youtube")
    return <Card addOnClick><div className="aspect-video"><iframe src={item.embedUrl} title={item.title || "YouTube"} className="h-full w-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" /></div>{titleBlock}</Card>;

  if (item.embedUrl && item.type === "facebook")
    return <Card><div className="min-h-[600px]"><iframe src={item.embedUrl} title={item.title || "Facebook post"} className="h-[800px] w-full" style={{ border: "none" }} scrolling="yes" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" /></div>{titleBlock}</Card>;

  if (item.embedUrl && item.type === "instagram")
    return <Card addOnClick><div className="flex justify-center bg-black/5 min-h-[450px]"><iframe src={item.embedUrl} title={item.title || "Instagram"} className="h-[520px] w-full max-w-[400px] mx-auto" style={{ border: "none" }} scrolling="yes" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" /></div>{titleBlock}</Card>;

  if (item.embedUrl && item.type === "twitter")
    return <Card addOnClick><div className="min-h-[350px] bg-white"><iframe src={item.embedUrl} title={item.title || "X / Twitter"} className="h-[450px] w-full" style={{ border: "none" }} scrolling="yes" allowFullScreen /></div>{titleBlock}</Card>;

  if (item.embedUrl && item.type === "tiktok")
    return <Card addOnClick><div className="flex justify-center bg-black/5 min-h-[500px]"><iframe src={item.embedUrl} title={item.title || "TikTok"} className="h-[580px] w-full max-w-[340px] mx-auto" style={{ border: "none" }} scrolling="yes" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" /></div>{titleBlock}</Card>;

  if (item.embedUrl && item.type === "vimeo")
    return <Card addOnClick><div className="aspect-video"><iframe src={item.embedUrl} title={item.title || "Vimeo"} className="h-full w-full" allowFullScreen allow="autoplay; fullscreen; picture-in-picture" /></div>{titleBlock}</Card>;

  if (item.type === "image")
    return <Card addOnClick><div className="overflow-hidden"><img src={item.url} alt={item.title || ""} className="h-full w-full object-contain bg-[#f5f0eb] transition-transform duration-500 group-hover:scale-105" loading="lazy" /></div>{titleBlock}</Card>;

  if (item.type === "video")
    return <Card><video controls className="w-full" preload="metadata"><source src={item.url} /></video>{titleBlock}</Card>;

  if (item.type === "embed")
    return <Card addOnClick><div className="aspect-video"><iframe src={item.url} title={item.title || "Embedded content"} className="h-full w-full" style={{ border: "none" }} sandbox="allow-scripts allow-same-origin allow-popups" loading="lazy" /></div>{titleBlock}</Card>;

  return <Card addOnClick><div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-6"><div className="text-center"><span className="text-4xl">🔗</span><p className="mt-2 text-sm font-semibold text-purple-600">{item.title || "Visit Link"}</p></div></div></Card>;
}

export default function AboutUsPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aboutUsApi.get()
      .then((res) => setAbout(unwrap(res)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[#faf8f5] min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="skeleton h-8 w-32 rounded-full" />
          <div className="skeleton mt-6 h-12 w-3/4" />
          <div className="skeleton mt-4 h-24 w-full" />
        </div>
      </div>
    );
  }

  const { heroTitle, heroSubtitle, story, mission, vision, mediaGallery = [], stats = [] } = about || {};

  return (
    <div className="bg-[#faf8f5] text-[#1c1c1e] min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-16">
        {/* Hero */}
        <section className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <Reveal variant="fade-left">
            <div>
              <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">Our Story</span>
              <h1 className="mt-4 text-3xl font-black md:text-5xl">{heroTitle}</h1>
              {heroSubtitle && <p className="mt-3 text-lg text-[#6b6b6b]">{heroSubtitle}</p>}
              {story && <p className="mt-5 text-base leading-relaxed text-[#6b6b6b] md:text-lg">{story}</p>}
            </div>
          </Reveal>
          <Reveal variant="fade-right" delay={100}>
            <div className="overflow-hidden rounded-3xl border border-[#1c1c1e]/8 bg-white shadow-xl shadow-[#1c1c1e]/5">
              {mediaGallery.find((m) => m.type === "image") ? (
                <img src={mediaGallery.find((m) => m.type === "image").url} alt="" className="h-[300px] w-full object-contain bg-[#f5f0eb] transition-transform duration-700 hover:scale-105 md:h-[400px]" />
              ) : (
                <img src="https://scontent.fdac138-1.fna.fbcdn.net/v/t39.30808-6/488810829_2414575812261767_7651822993987112107_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=jCsxVaWTMN4Q7kNvwHtzOVF&_nc_oc=AdqwC5XAR9f259CVd-I58-SV-5buKcdUBQlEGNyQNAF5A6xNSOpZcuWuBNOq-DR4fY4&_nc_zt=23&_nc_ht=scontent.fdac138-1.fna&_nc_gid=Iijw5518iE_cASlpTk2g-w&_nc_ss=7b2a8&oh=00_Af7FSKYY00a4Bh1eo_qgELjckozMse-6uIUai_g704iTsQ&oe=6A092B49" alt="Barista Training Bangladesh" className="h-[300px] w-full object-contain bg-[#f5f0eb] transition-transform duration-700 hover:scale-105 md:h-[400px]" />
              )}
            </div>
          </Reveal>
        </section>

        {/* Team Profiles */}
        <Reveal variant="fade-up" delay={120}>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-[#d4803c]/20 bg-[#f5f0eb] md:h-36 md:w-36">
                <img src="https://scontent.fdac138-1.fna.fbcdn.net/v/t39.30808-6/488810829_2414575812261767_7651822993987112107_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=jCsxVaWTMN4Q7kNvwHtzOVF&_nc_oc=AdqwC5XAR9f259CVd-I58-SV-5buKcdUBQlEGNyQNAF5A6xNSOpZcuWuBNOq-DR4fY4&_nc_zt=23&_nc_ht=scontent.fdac138-1.fna&_nc_gid=Iijw5518iE_cASlpTk2g-w&_nc_ss=7b2a8&oh=00_Af7FSKYY00a4Bh1eo_qgELjckozMse-6uIUai_g704iTsQ&oe=6A092B49" alt="Chef Md. Azom Ali" className="h-full w-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black md:text-3xl">Chef Md. Azom Ali</h2>
                <p className="mt-1 text-sm font-semibold text-[#d4803c]">Head of Culinary &amp; Barista Training</p>
                <div className="mt-4 space-y-2 text-sm text-[#6b6b6b]">
                  <p><span className="font-semibold text-[#1c1c1e]">Western Grill Chef</span> — Chef, Mr. Burger (Ex Chef)</p>
                  <p><span className="font-semibold text-[#1c1c1e]">Head Chef</span> — Salt Grill</p>
                  <p><span className="font-semibold text-[#1c1c1e]">Faculty</span> — ICI International Culinary Institute Dhaka</p>
                  <p><span className="font-semibold text-[#1c1c1e]">Corporate Chef</span> — Nestlé Bangladesh PLC</p>
                </div>
              </div>
            </div>
            </div>

            <div className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-[#d4803c]/20 bg-[#f5f0eb] md:h-36 md:w-36">
                  <img src="/image.jpg" alt="Niharika Mou" className="h-full w-full object-cover" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-black md:text-3xl">Niharika Mou</h2>
                  <p className="mt-1 text-sm font-semibold text-[#d4803c]">Barista Trainer</p>
                  <p className="mt-4 text-sm leading-relaxed text-[#6b6b6b]">
                    Professional barista trainer specializing in espresso preparation, latte art, and coffee brewing techniques. Dedicated to shaping the next generation of coffee professionals at Barista Training Bangladesh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Stats */}
        {stats.length > 0 && (
          <Reveal variant="fade-up" delay={150}>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <span className="text-3xl">{stat.icon || "📊"}</span>
                  <p className="mt-3 text-2xl font-black">{stat.value}</p>
                  <p className="mt-1 text-sm text-[#6b6b6b]">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Mission & Vision */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {mission && (
            <Reveal variant="fade-up" delay={100}>
              <div className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8">
                <span className="text-3xl">🎯</span>
                <h2 className="mt-4 text-2xl font-bold">Our Mission</h2>
                <p className="mt-3 leading-relaxed text-[#6b6b6b]">{mission}</p>
              </div>
            </Reveal>
          )}
          {vision && (
            <Reveal variant="fade-up" delay={200}>
              <div className="rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8">
                <span className="text-3xl">🔭</span>
                <h2 className="mt-4 text-2xl font-bold">Our Vision</h2>
                <p className="mt-3 leading-relaxed text-[#6b6b6b]">{vision}</p>
              </div>
            </Reveal>
          )}
        </div>

        {/* Media Gallery */}
        {mediaGallery.length > 0 && (
          <Reveal variant="fade-up" delay={230}>
            <div className="mt-12">
              <h2 className="text-3xl font-black">Gallery</h2>
              <p className="mt-2 text-[#6b6b6b]">Photos and media from our academy</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mediaGallery.map((item, i) => (
                  <div key={item._id || i} className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
                    <MediaEmbed item={item} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Social Feed — full FB posts & YT videos selected by admin */}
        {about?.videoCollage?.length > 0 && (
          <Reveal variant="fade-up" delay={250}>
            <div className="mt-12">
              <h2 className="text-3xl font-black">Social Feed</h2>
              <p className="mt-2 text-[#6b6b6b]">Follow us on social media</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {about.videoCollage.map((item, i) => (
                  <div key={item._id || i}>
                    {item.type === "youtube" && item.embedUrl ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-[#1c1c1e]/6 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer">
                        <div className="aspect-video">
                          <iframe src={item.embedUrl} title={item.title || "YouTube"} className="h-full w-full" allowFullScreen allow="autoplay; encrypted-media; gyroscope; picture-in-picture" />
                        </div>
                        {item.title && <div className="p-4 border-t border-[#1c1c1e]/6"><p className="font-semibold">{item.title}</p></div>}
                      </a>
                    ) : item.type === "facebook" && item.embedUrl ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-[#1c1c1e]/6 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer">
                        <div className="min-h-[600px]">
                          <iframe src={item.embedUrl} title={item.title || "Facebook post"} className="h-[800px] w-full" style={{ border: "none" }} scrolling="yes" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" />
                        </div>
                        {item.title && <div className="p-4 border-t border-[#1c1c1e]/6"><p className="font-semibold">{item.title}</p></div>}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
