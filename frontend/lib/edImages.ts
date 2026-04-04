// ─────────────────────────────────────────────────────────────────
//  LOCAL EVENTDHARA IMAGES  (temporary until DB/CDN is connected)
//  Source: ED interns-20260330T180111Z-1-001
//  Replace img_url fields with backend API URLs when ready.
// ─────────────────────────────────────────────────────────────────

export const ED_IMAGES = {

  anniversary: [
    '/images/ed/anniversary/0257132cab7b41faef5e6db31867aaf4.jpg',
    '/images/ed/anniversary/0be373c2b28f3d19900c891067dec9e7_1.jpg',
    '/images/ed/anniversary/15d3755609549dfa8ed643feca2e51e4.jpg',
    '/images/ed/anniversary/20192c8079962726190f0afe2d10c87b.jpg',
    '/images/ed/anniversary/4663fd7543ecf3491cad5f26bfd6e757.jpg',
    '/images/ed/anniversary/55ee835f9219eea90864022380cf3d09.jpg',
  ],

  birthday: [
    '/images/ed/birthday/01.jpg',
    '/images/ed/birthday/02.jpg',
    '/images/ed/birthday/03.jpg',
    '/images/ed/birthday/04.jpg',
    '/images/ed/birthday/05.jpg',
    '/images/ed/birthday/06.jpg',
    '/images/ed/birthday/07.jpg',
  ],

  baby_shower: [
    '/images/ed/baby_shower/06ecd407e0ed2480d5d952c758565957.jpg',
    '/images/ed/baby_shower/1b378ae61fbdf94690ecd8e0b8dc966d.jpg',
    '/images/ed/baby_shower/1b5a19a88cdbd22086a2176d7f039757.jpg',
    '/images/ed/baby_shower/1d9c34201e0a6f2b0b6b793650d4d9ac.jpg',
    '/images/ed/baby_shower/1687933622_webp_large.webp',
  ],

  wedding: [
    '/images/ed/wedding/06ffdd897e318a18282a873ffd906287.jpg',
    '/images/ed/wedding/0a1e1852ac46bc767eb10cca34022d7f.jpg',
    '/images/ed/wedding/0fa286a95423475d7c9f7e0381924c7d.jpg',
    '/images/ed/wedding/0ebdc1bc2bce4d6ba01f4c8b9c96457d.webp.jpg',
    '/images/ed/wedding/0fee809bcabf87d44ea0d4825e7047d4.webp.jpg',
    '/images/ed/wedding/0e2bb03fc87bd002a83f180cea3b2161.webp.jpg',
  ],

  haldi: [
    '/images/ed/haldi/image_10.jpg',
    '/images/ed/haldi/image_103.jpg',
    '/images/ed/haldi/image_104.jpg',
    '/images/ed/haldi/image_107.jpg',
    '/images/ed/haldi/image_108.jpg',
    '/images/ed/haldi/image_112.jpg',
  ],

  ring_ceremony: [
    '/images/ed/ring_ceremony/0c522bb625edab9c391e86739a78f2bd.jpg',
    '/images/ed/ring_ceremony/13a9c39a54f65bb548ad1c451e3dbb16.jpg',
    '/images/ed/ring_ceremony/1e7921f32f76e3a14f530b2bd1e1e151.jpg',
    '/images/ed/ring_ceremony/2436a25752856e537e9ba21717cd3abd.jpg',
    '/images/ed/ring_ceremony/28977c48ec8fb5d9532376edcb578ffc.jpg',
    '/images/ed/ring_ceremony/293dd03f93ee687fd80f9efa48fa1f27.jpg',
  ],

  mehndi: [
    '/images/ed/mehndi/image_1.jpg',
    '/images/ed/mehndi/IMG-20260319-WA0033.jpg',
    '/images/ed/mehndi/IMG-20260319-WA0034.jpg',
    '/images/ed/mehndi/IMG-20260319-WA0035.jpg',
    '/images/ed/mehndi/IMG-20260319-WA0037.jpg',
    '/images/ed/mehndi/IMG-20260319-WA0038.jpg',
  ],

  mandap: [
    '/images/ed/mandap/Mandap1.jpeg',
    '/images/ed/mandap/Mandap2.jpeg',
    '/images/ed/mandap/Mandap3.jpeg',
    '/images/ed/mandap/Mandap4.jpeg',
    '/images/ed/mandap/Mandap5.jpeg',
    '/images/ed/mandap/Mandap6.jpeg',
    '/images/ed/mandap/Mandap10.jpeg',
    '/images/ed/mandap/Mandap11.jpeg',
    '/images/ed/mandap/Mandap12.jpeg',
    '/images/ed/mandap/Mandap100.jpeg',
  ],

  stage: [
    '/images/ed/stage/0ed2b5eb190dd53044a007c199cc2eb1.jpg',
    '/images/ed/stage/2e1c9c084d5c310551217289dcb53b2e.jpg',
    '/images/ed/stage/3175d6889c19c4725d95fdab0ecc3ba3.jpg',
    '/images/ed/stage/image_1.jpg',
    '/images/ed/stage/image_102.jpg',
  ],

  general: [
    '/images/ed/general/027f0ddfe684d42faf7dc9b227ee25ef.jpg',
    '/images/ed/general/0813d38ed08cae578b77ec3467109d29.webp.jpg',
    '/images/ed/general/0970b2831eaaabe546c3fc405823b71a.jpg',
    '/images/ed/general/0aeb1eadcef2961122a678b0b1b74fd7.jpg',
  ],
};

export type EdCategory = keyof typeof ED_IMAGES;

/** Pick the nth image from a category, cycling if the index overflows */
export function edImg(category: EdCategory, index = 0): string {
  const arr = ED_IMAGES[category];
  return arr?.[index % arr.length] ?? '/images/ed/mandap/Mandap1.jpeg';
}

/** Get all images for a category */
export function edImgs(category: EdCategory): string[] {
  return ED_IMAGES[category] ?? [];
}
