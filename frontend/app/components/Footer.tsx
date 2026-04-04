import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail } from 'lucide-react';

const FOOTER_LINKS = {
  'Occasions': [
    { label: 'Birthday', href: '/shop?occasion=birthday' },
    { label: 'Anniversary', href: '/shop?occasion=anniversary' },
    { label: 'Wedding', href: '/shop?occasion=wedding' },
    { label: 'Baby Shower', href: '/shop?occasion=baby_shower' },
    { label: 'Engagement', href: '/shop?occasion=engagement' },
    { label: 'Bachelorette', href: '/shop?occasion=bachelorette' },
  ],
  'Services': [
    { label: 'Balloon Decoration', href: '/shop?category=Balloon+Decoration' },
    { label: 'Photography', href: '/shop?category=Photography' },
    { label: 'Mehndi', href: '/shop?category=Mehndi' },
    { label: 'Makeup & Styling', href: '/shop?category=Makeup+%26+Styling' },
    { label: 'DJ & Music', href: '/shop?category=DJ+%26+Music' },
    { label: 'Cake & Desserts', href: '/shop?category=Cake+%26+Desserts' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  'Support': [
    { label: 'Help Center', href: '/help' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer grid */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block mb-6 transition-transform hover:scale-[1.02]">
              <Image 
                src="/Eventdhara_logo.png" 
                alt="EventDhara Logo" 
                width={1668} 
                height={394} 
                className="object-contain w-[180px] md:w-[220px] lg:w-[250px] h-auto"
                priority
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              India's trusted platform to book event services for every occasion. From decor to photography, we've got your celebrations covered.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Serving 6 cities across MP</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Phone className="w-4 h-4 text-orange-400 shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
              <Mail className="w-4 h-4 text-orange-400 shrink-0" />
              <span>hello@eventdhara.com</span>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {[
                { label: 'IG',  href: '#', color: 'hover:bg-pink-500' },
                { label: 'FB',  href: '#', color: 'hover:bg-blue-600' },
                { label: 'TW',  href: '#', color: 'hover:bg-sky-500'  },
                { label: 'YT',  href: '#', color: 'hover:bg-red-600'  },
              ].map(s => (
                <a key={s.label} href={s.href} className={`w-9 h-9 rounded-full bg-gray-800 ${s.color} flex items-center justify-center transition-colors text-xs font-bold text-white`}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 xl:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2025 EventDhara. All rights reserved.</p>
          <p className="text-xs text-gray-500">Made with ❤️ in Indore, India</p>
        </div>
      </div>
    </footer>
  );
}
