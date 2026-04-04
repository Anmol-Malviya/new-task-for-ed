'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

// ── Local EventDhara images (from intern photos) ─────────────────────────────
const IMG = {
  // Birthday
  birthday0:     '/images/ed/birthday/01.jpg',
  birthday1:     '/images/ed/birthday/02.jpg',
  birthday2:     '/images/ed/birthday/03.jpg',
  birthday3:     '/images/ed/birthday/04.jpg',
  birthday4:     '/images/ed/birthday/05.jpg',
  // Anniversary
  anniversary0:  '/images/ed/anniversary/0257132cab7b41faef5e6db31867aaf4.jpg',
  anniversary1:  '/images/ed/anniversary/15d3755609549dfa8ed643feca2e51e4.jpg',
  anniversary2:  '/images/ed/anniversary/20192c8079962726190f0afe2d10c87b.jpg',
  anniversary3:  '/images/ed/anniversary/4663fd7543ecf3491cad5f26bfd6e757.jpg',
  // Wedding / Mandap
  mandap0:       '/images/ed/mandap/Mandap1.jpeg',
  mandap1:       '/images/ed/mandap/Mandap2.jpeg',
  mandap2:       '/images/ed/mandap/Mandap3.jpeg',
  mandap3:       '/images/ed/mandap/Mandap10.jpeg',
  wedding0:      '/images/ed/wedding/06ffdd897e318a18282a873ffd906287.jpg',
  wedding1:      '/images/ed/wedding/0a1e1852ac46bc767eb10cca34022d7f.jpg',
  wedding2:      '/images/ed/wedding/0fa286a95423475d7c9f7e0381924c7d.jpg',
  // Ring Ceremony
  ring0:         '/images/ed/ring_ceremony/0c522bb625edab9c391e86739a78f2bd.jpg',
  ring1:         '/images/ed/ring_ceremony/13a9c39a54f65bb548ad1c451e3dbb16.jpg',
  ring2:         '/images/ed/ring_ceremony/1e7921f32f76e3a14f530b2bd1e1e151.jpg',
  ring3:         '/images/ed/ring_ceremony/2436a25752856e537e9ba21717cd3abd.jpg',
  // Mehndi
  mehndi0:       '/images/ed/mehndi/image_1.jpg',
  mehndi1:       '/images/ed/mehndi/IMG-20260319-WA0033.jpg',
  mehndi2:       '/images/ed/mehndi/IMG-20260319-WA0034.jpg',
  // Haldi
  haldi0:        '/images/ed/haldi/image_10.jpg',
  haldi1:        '/images/ed/haldi/image_103.jpg',
  haldi2:        '/images/ed/haldi/image_104.jpg',
  // Baby Shower
  baby0:         '/images/ed/baby_shower/06ecd407e0ed2480d5d952c758565957.jpg',
  baby1:         '/images/ed/baby_shower/1b378ae61fbdf94690ecd8e0b8dc966d.jpg',
  baby2:         '/images/ed/baby_shower/1b5a19a88cdbd22086a2176d7f039757.jpg',
  // Stage / Bachelorette
  stage0:        '/images/ed/stage/0ed2b5eb190dd53044a007c199cc2eb1.jpg',
  stage1:        '/images/ed/stage/2e1c9c084d5c310551217289dcb53b2e.jpg',
  stage2:        '/images/ed/stage/image_1.jpg',
  // General
  general0:      '/images/ed/general/027f0ddfe684d42faf7dc9b227ee25ef.jpg',
  general1:      '/images/ed/general/0970b2831eaaabe546c3fc405823b71a.jpg',
};

type ThemeItem = { label: string; img: string; color: string };

type OccasionTheme = {
  id: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  emoji: string;
  title: React.ReactNode;
  subtitle: string;
  cta: string;
  ctaColor: string;
  textColor: string;
  subtitleColor: string;
  decoEmoji: string;
  bgDecoDark?: boolean;
  flipRow?: boolean;
  heroImg: string;
  items: ThemeItem[];
};

const THEMES: OccasionTheme[] = [
  // ────────────────── BIRTHDAY ──────────────────
  {
    id: 'birthday',
    accentBg: 'linear-gradient(135deg,#FFF3E6 0%,#FFE8D6 55%,#FFEEF4 100%)',
    badgeBg: 'bg-white/70', badgeText: 'text-orange-600',
    badgeLabel: '🎂 Birthday Specials',
    emoji: '🎈', decoEmoji: '🎈',
    title: <>Make Their<br/><span className="text-orange-500">Birthday</span><br/>Unforgettable!</>,
    subtitle: 'From balloon arches to personalised cakes — every detail, perfectly planned.',
    cta: 'Shop Birthday', ctaColor: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-gray-900', subtitleColor: 'text-gray-600',
    flipRow: false,
    heroImg: IMG.birthday0,
    items: [
      { label: 'Balloon Decor',   img: IMG.birthday0,   color: '#FFE4D6' },
      { label: 'Birthday Setup',  img: IMG.birthday1,   color: '#FFF0CC' },
      { label: 'Party Supplies',  img: IMG.birthday2,   color: '#FFE0F0' },
      { label: 'Cake & Desserts', img: IMG.birthday3,   color: '#FFF3CC' },
      { label: 'Flower Decor',    img: IMG.anniversary0, color: '#FFE3EE' },
      { label: 'Gift Hampers',    img: IMG.general0,    color: '#E8F4FF' },
      { label: 'Ring Ceremony',   img: IMG.ring0,       color: '#FFF0DC' },
      { label: 'Surprise Setup',  img: IMG.birthday4,   color: '#FFE0F8' },
    ],
  },

  // ────────────────── ANNIVERSARY ──────────────────
  {
    id: 'anniversary',
    accentBg: 'linear-gradient(135deg,#FFF0F5 0%,#FFE5EE 55%,#FFF5F0 100%)',
    badgeBg: 'bg-white/70', badgeText: 'text-rose-700',
    badgeLabel: '💍 Anniversary Collection',
    emoji: '❤️', decoEmoji: '❤️',
    title: <>Celebrate<br/>Your <span className="text-rose-600">Love</span><br/>Story</>,
    subtitle: 'Romantic setups, couple photoshoots & curated gifting — crafted with love.',
    cta: 'Explore Romance', ctaColor: 'bg-rose-600 hover:bg-rose-700',
    textColor: 'text-gray-900', subtitleColor: 'text-gray-600',
    flipRow: true,
    heroImg: IMG.anniversary0,
    items: [
      { label: 'Rose Candle Decor', img: IMG.anniversary0,  color: '#FFDDE8' },
      { label: 'Couple Photoshoot', img: IMG.anniversary1,  color: '#FFF0F0' },
      { label: 'Romantic Dinner',   img: IMG.anniversary2,  color: '#FFF5E0' },
      { label: 'Ring Ceremony',     img: IMG.ring0,         color: '#FFF0FF' },
      { label: 'Flower Bed Setup',  img: IMG.anniversary3,  color: '#FFE8E8' },
      { label: 'Balloon Setup',     img: IMG.birthday0,     color: '#FFE8F5' },
      { label: 'Mehndi Setup',      img: IMG.mehndi0,       color: '#F5E8FF' },
      { label: 'Surprise Plan',     img: IMG.ring1,         color: '#FFE0E8' },
    ],
  },

  // ────────────────── WEDDING ──────────────────
  {
    id: 'wedding',
    accentBg: 'linear-gradient(135deg,#FFFDF0 0%,#FFF8DC 55%,#FFF5F0 100%)',
    badgeBg: 'bg-white/70', badgeText: 'text-amber-700',
    badgeLabel: '💒 Wedding Specials',
    emoji: '✨', decoEmoji: '👰',
    title: <>Your Dream<br/><span className="text-amber-600">Wedding</span><br/>Awaits</>,
    subtitle: 'Complete wedding planning, decor, photography & more — all in one place.',
    cta: 'Plan Wedding', ctaColor: 'bg-amber-600 hover:bg-amber-700',
    textColor: 'text-gray-900', subtitleColor: 'text-gray-600',
    flipRow: false,
    heroImg: IMG.mandap0,
    items: [
      { label: 'Mandap Decor',   img: IMG.mandap0,      color: '#FFF8E0' },
      { label: 'Ring Ceremony',  img: IMG.ring0,        color: '#FFEEEE' },
      { label: 'Bridal Entry',   img: IMG.wedding0,     color: '#F0F8FF' },
      { label: 'Mehndi Setup',   img: IMG.mehndi0,      color: '#EFFFEF' },
      { label: 'Floral Setup',   img: IMG.wedding1,     color: '#FFF0FF' },
      { label: 'Haldi Decor',    img: IMG.haldi0,       color: '#FFFAE0' },
      { label: 'Mandap Detail',  img: IMG.mandap1,      color: '#F5F0FF' },
      { label: 'Venue Decor',    img: IMG.mandap2,      color: '#FFF5E8' },
    ],
  },

  // ────────────────── BABY SHOWER ──────────────────
  {
    id: 'baby_shower',
    accentBg: 'linear-gradient(135deg,#F0FFF8 0%,#EEF8FF 55%,#F8F0FF 100%)',
    badgeBg: 'bg-white/70', badgeText: 'text-teal-700',
    badgeLabel: '👶 Baby Shower',
    emoji: '⭐', decoEmoji: '🍼',
    title: <>Welcome the<br/><span className="text-teal-600">Little One</span><br/>in Style!</>,
    subtitle: 'Adorable themes, sweet treats, and whimsical decor for your baby shower.',
    cta: 'Shop Baby Shower', ctaColor: 'bg-teal-600 hover:bg-teal-700',
    textColor: 'text-gray-900', subtitleColor: 'text-gray-600',
    flipRow: true,
    heroImg: IMG.baby0,
    items: [
      { label: 'Balloon Arch',   img: IMG.baby0,        color: '#E0F7F4' },
      { label: 'Theme Decor',    img: IMG.baby1,        color: '#F0E8FF' },
      { label: 'Sweet Table',    img: IMG.baby2,        color: '#E8F5FF' },
      { label: 'Floral Decor',   img: IMG.anniversary0, color: '#FFF0F8' },
      { label: 'Balloon Setup',  img: IMG.birthday0,    color: '#F0FFF4' },
      { label: 'Gift Hampers',   img: IMG.general1,     color: '#FFFDE8' },
      { label: 'Entry Decor',    img: IMG.baby1,        color: '#E8EEFF' },
      { label: 'Return Gifts',   img: IMG.baby2,        color: '#FFE8F8' },
    ],
  },

  // ────────────────── BACHELORETTE ──────────────────
  {
    id: 'bachelorette',
    accentBg: 'linear-gradient(135deg,#1A0533 0%,#2D0A5E 55%,#180040 100%)',
    badgeBg: 'bg-white/10', badgeText: 'text-pink-300',
    badgeLabel: '🥂 Bachelorette Party',
    emoji: '✨', decoEmoji: '💃',
    title: <>Last Night<br/>of <span className="text-pink-400">Freedom</span><br/>Done Right!</>,
    subtitle: 'Glam setups, party props, sash & slay — make her night legendary.',
    cta: 'Plan the Party', ctaColor: 'bg-pink-500 hover:bg-pink-400',
    textColor: 'text-white', subtitleColor: 'text-purple-200',
    bgDecoDark: true,
    flipRow: false,
    heroImg: IMG.stage0,
    items: [
      { label: 'Balloon Wall',  img: IMG.birthday0,    color: '#3D105E' },
      { label: 'Stage Setup',   img: IMG.stage0,       color: '#3A1060' },
      { label: 'Party Decor',   img: IMG.birthday1,    color: '#38095C' },
      { label: 'Photo Booth',   img: IMG.stage1,       color: '#400E68' },
      { label: 'Neon Decor',    img: IMG.stage2,       color: '#35085A' },
      { label: 'DJ Night',      img: IMG.birthday2,    color: '#3C0F65' },
      { label: 'Ring Setup',    img: IMG.ring2,        color: '#420D70' },
      { label: 'Makeover',      img: IMG.general0,     color: '#3F1068' },
    ],
  },

  // ────────────────── ENGAGEMENT ──────────────────
  {
    id: 'engagement',
    accentBg: 'linear-gradient(135deg,#FFF8F5 0%,#FFF0F5 40%,#FFFBF0 100%)',
    badgeBg: 'bg-white/70', badgeText: 'text-rose-600',
    badgeLabel: '💎 Engagement',
    emoji: '💎', decoEmoji: '💍',
    title: <>Pop The<br/><span className="text-rose-500">Question</span><br/>Perfectly!</>,
    subtitle: "Proposal setups, ring ceremony decor & couple moments you'll cherish forever.",
    cta: 'Plan Engagement', ctaColor: 'bg-rose-500 hover:bg-rose-600',
    textColor: 'text-gray-900', subtitleColor: 'text-gray-600',
    flipRow: true,
    heroImg: IMG.ring0,
    items: [
      { label: 'Ring Setup',      img: IMG.ring0,        color: '#FFF0F5' },
      { label: 'Proposal Decor',  img: IMG.ring1,        color: '#FFF5E0' },
      { label: 'Couple Shoot',    img: IMG.ring2,        color: '#F5F0FF' },
      { label: 'Flower Wall',     img: IMG.anniversary0, color: '#FFF0E8' },
      { label: 'Stage Decor',     img: IMG.ring3,        color: '#FFE8F5' },
      { label: 'Balloon Decor',   img: IMG.birthday0,    color: '#F0F8FF' },
      { label: 'Mehndi Design',   img: IMG.mehndi1,      color: '#EFFFEF' },
      { label: 'Mandap Decor',    img: IMG.mandap3,      color: '#FFF8E0' },
    ],
  },
];

export default function OccasionThemeSection({ occasionId }: { occasionId: string }) {
  const theme = THEMES.find(t => t.id === occasionId);
  if (!theme) return null;

  const isDark = theme.bgDecoDark === true;
  const labelColor = isDark ? 'text-white' : 'text-gray-800';

  return (
    <section className="pb-14 max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12">
      <div className="rounded-[2rem] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.07)]" style={{ background: theme.accentBg }}>
        <div className={`flex flex-col ${theme.flipRow ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>

          {/* ── Hero Panel ── */}
          <div className="lg:w-[38%] relative p-8 md:p-10 xl:p-12 flex flex-col justify-between min-h-[360px] overflow-hidden">
            {/* Background hero image — large, faded */}
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src={theme.heroImg}
                alt=""
                fill
                className="object-cover object-center opacity-10"
              />
              <div className="absolute inset-0" style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(26,5,51,0.95) 0%, rgba(45,10,94,0.90) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 100%)'
              }} />
            </div>

            {/* Deco emojis */}
            {['8% 10%', '80% 6%', '10% 78%', '75% 75%', '48% 40%'].map((pos, i) => (
              <div
                key={i}
                className="absolute text-2xl opacity-20 pointer-events-none select-none"
                style={{ left: pos.split(' ')[0], top: pos.split(' ')[1] }}
              >
                {theme.emoji}
              </div>
            ))}

            <div className="relative z-10">
              <div className={`inline-flex items-center gap-2 ${theme.badgeBg} backdrop-blur-sm px-4 py-2 rounded-full text-xs font-black ${theme.badgeText} uppercase tracking-widest mb-6 shadow-sm`}>
                {theme.badgeLabel}
              </div>
              <h3 className={`text-[30px] md:text-[38px] xl:text-[42px] font-black ${theme.textColor} leading-[1.1] mb-4`}>
                {theme.title}
              </h3>
              <p className={`${theme.subtitleColor} font-semibold text-sm md:text-base mb-8 max-w-xs leading-relaxed`}>
                {theme.subtitle}
              </p>
            </div>

            <div className="relative z-10">
              <Link
                href={`/shop?occasion=${theme.id}`}
                className={`inline-flex items-center gap-2 ${theme.ctaColor} text-white font-black text-sm px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300`}
              >
                {theme.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Large deco emoji watermark */}
            <div className="absolute bottom-4 right-6 text-[110px] leading-none opacity-10 select-none pointer-events-none">
              {theme.decoEmoji}
            </div>
          </div>

          {/* ── 8-Item Grid ── */}
          <div className="lg:w-[62%] grid grid-cols-4 gap-3 md:gap-4 p-5 md:p-8 xl:p-10">
            {theme.items.map((col, i) => (
              <Link
                href={`/shop?occasion=${theme.id}`}
                key={i}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={[
                    'w-full aspect-square rounded-2xl overflow-hidden relative',
                    'border-2 group-hover:-translate-y-1.5 transition-all duration-300',
                    isDark
                      ? 'border-purple-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_8px_28px_rgba(236,72,153,0.45)]'
                      : 'border-white shadow-md group-hover:shadow-xl',
                  ].join(' ')}
                  style={{ background: col.color }}
                >
                  <Image
                    src={col.img}
                    alt={col.label}
                    fill
                    className={`object-cover group-hover:scale-110 transition-transform duration-500 ${isDark ? 'opacity-75 group-hover:opacity-100' : ''}`}
                  />
                  {isDark && (
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent" />
                  )}
                  {/* Hover label overlay */}
                  <div className="absolute inset-x-0 bottom-0 py-1.5 px-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                    <span className="text-white text-[10px] font-black">{col.label}</span>
                  </div>
                </div>
                <span className={`text-[11px] md:text-xs font-bold ${labelColor} text-center leading-tight px-1`}>
                  {col.label}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
