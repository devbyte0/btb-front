"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { carouselApi, aboutUsApi } from "@/lib/api";
import Reveal from "@/components/Reveal";
import PopupAd from "@/components/PopupAd";

const unwrap = (res) => res?.data || [];

export default function HomeClient() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    carouselApi.list().then((res) => {
      const items = unwrap(res);
      setSlides(items);
    }).catch(() => {});
    aboutUsApi.get().then((res) => {
      const data = res?.data || res;
      if (data?.videoCollage) setVideos(data.videoCollage);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="bg-[#faf8f5] text-[#1c1c1e]">
      <PopupAd />
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-10 pt-16 md:grid-cols-5 md:gap-12 md:px-8 md:pb-16 md:pt-24">
        <div className="flex flex-col justify-center md:col-span-3">
          <Reveal variant="fade-up">
            <span className="mb-4 inline-block w-fit rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#d4803c] uppercase">
              Premium Coffee Education in Bangladesh
            </span>
          </Reveal>
          <Reveal delay={100} variant="fade-up">
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-7xl">
              Become a world-class
              <br />
              <span className="gradient-text">barista artist.</span>
            </h1>
          </Reveal>
          <Reveal delay={200} variant="fade-up">
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#6b6b6b] md:text-lg">
              From espresso fundamentals to stunning latte art and cafe business mastery,
              Barista Training Bangladesh trains you to brew confidently and serve with style.
            </p>
          </Reveal>
          <Reveal delay={300} variant="fade-up">
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/courses" className="btn-primary rounded-full px-7 py-3.5 font-semibold text-white">Explore Courses</Link>
              <Link href="/login" className="btn-secondary rounded-full px-7 py-3.5 font-semibold text-[#1c1c1e]">Login to Dashboard</Link>
            </div>
          </Reveal>
        </div>
        <div className="relative md:col-span-2">
          <Reveal delay={150} variant="scale-in">
            <div className="overflow-hidden rounded-3xl border border-[#1c1c1e]/8 bg-white shadow-xl shadow-[#1c1c1e]/5 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4803c]/10">
              <Image src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1300&q=80" alt="Latte art and coffee setup" width={1200} height={900} className="h-[280px] w-full object-cover transition-transform duration-700 hover:scale-105 md:h-[400px]" priority />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-8 md:pb-20">
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          <Reveal className="col-span-2" delay={50} variant="fade-up">
            <div className="group rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#d4803c]/20 hover:shadow-xl hover:shadow-[#d4803c]/5 md:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4803c]/10 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">☕</div>
              <h3 className="text-xl font-bold md:text-2xl">Hands-on Training</h3>
              <p className="mt-2 max-w-md text-[#6b6b6b]">Practice daily on professional espresso machines with expert guidance.</p>
            </div>
          </Reveal>
          <Reveal delay={150} variant="fade-up">
            <div className="group rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#d4803c]/20 hover:shadow-xl hover:shadow-[#d4803c]/5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4803c]/10 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">🎨</div>
              <h3 className="text-lg font-bold">Latte Art Mastery</h3>
              <p className="mt-2 text-sm text-[#6b6b6b]">Heart, tulip, swan, and advanced free-pour designs.</p>
            </div>
          </Reveal>
          <Reveal delay={200} variant="fade-up">
            <div className="group rounded-2xl border border-[#1c1c1e]/6 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#d4803c]/20 hover:shadow-xl hover:shadow-[#d4803c]/5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4803c]/10 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">🚀</div>
              <h3 className="text-lg font-bold">Career Support</h3>
              <p className="mt-2 text-sm text-[#6b6b6b]">Portfolio building and placement guidance.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Video Collage — auto-play with sound */}
      {videos.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-8 md:pb-20">
          <Reveal variant="fade-up">
            <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">Video Gallery</span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">See Us in Action</h2>
            <p className="mt-3 text-[#6b6b6b]">Watch our training sessions and coffee craft</p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video, i) => {
                const isReel = video.url && /reel/i.test(video.url);
                return (
              <Reveal key={video._id || i} delay={i * 80} variant="fade-up">
                <div className={`group overflow-hidden rounded-2xl border border-[#1c1c1e]/6 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${isReel ? "max-w-[320px] mx-auto" : ""}`}>
                  {video.type === "youtube" && video.embedUrl ? (
                    <div className="aspect-video">
                      <iframe src={`${video.embedUrl}?autoplay=1&mute=0&loop=1`} title={video.title || "YouTube"} className="h-full w-full" allow="autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : video.type === "facebook" && video.embedUrl ? (
                    <div className={isReel ? "aspect-[9/16] bg-black" : "aspect-video"}>
                      <iframe src={`${video.embedUrl}&autoplay=1`} title={video.title || "Facebook video"} className="h-full w-full" style={{ border: "none", overflow: "hidden" }} scrolling="no" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#d4803c]/10 to-[#e8a86a]/10">
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-center">
                        <span className="text-4xl">▶</span>
                        <p className="mt-2 text-sm font-semibold text-[#d4803c]">{video.title || "Watch Video"}</p>
                      </a>
                    </div>
                  )}
                  {video.title && <div className="p-4 border-t border-[#1c1c1e]/6"><p className="font-semibold">{video.title}</p></div>}
                </div>
              </Reveal>
                );
              })}
          </div>
        </section>
      )}

      {/* Carousel Gallery — under Explore Courses */}
      {slides.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
          <Reveal variant="fade-up">
            <span className="inline-block rounded-full border border-[#d4803c]/20 bg-[#d4803c]/8 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-[#d4803c] uppercase">
              Gallery
            </span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">Our Campus &amp; Training</h2>
            <p className="mt-3 text-[#6b6b6b]">Take a tour of our academy</p>
          </Reveal>

          <div className="relative mt-8 overflow-hidden rounded-3xl">
            <div className="relative h-[400px] w-full md:h-[500px]">
              {slides.map((slide, i) => (
                <div
                  key={slide._id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    i === current ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                  }`}
                >
                  <img src={slide.imageUrl} alt={slide.title || ""} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    {slide.title && <h3 className="text-2xl font-bold text-white md:text-3xl">{slide.title}</h3>}
                    {slide.subtitle && <p className="mt-2 text-white/80">{slide.subtitle}</p>}
                    {slide.linkUrl && (
                      <Link href={slide.linkUrl} className="btn-primary mt-4 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white">
                        {slide.linkLabel || "Learn More"}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {slides.length > 1 && (
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      i === current ? "w-8 bg-[#f39b45]" : "w-3 bg-white/60 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
