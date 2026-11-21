// ====== EDIT THIS FILE: your restaurant details and your Supabase keys ======
// Supabase > Project Settings > API: copy the "Project URL" and the "anon public" key.
// (The anon key is meant to be public. The database rules in schema.sql are what protect your data.
//  NEVER paste the "service_role" key here.)
window.SITE = {
  supabaseUrl: 'https://YOUR-PROJECT-ID.supabase.co',
  supabaseAnonKey: 'sb_publishable_yG6bT0etvrkVCSQUonl7EA_iWLcK_Ea',

  name: 'Umugati Kitchen',
  tagline: 'Fresh Rwandan food, cooked with love.',
  about: 'A small family restaurant in the heart of Kigali. Everything is cooked fresh every day, from our brochettes to our home-style stews. Come hungry, leave happy.',
  phone: '+250 788 000 000',
  whatsapp: '250788000000',          // digits only, with country code. Leave empty to hide the WhatsApp button.
  email: 'hello@example.com',
  address: 'KN 1 Road, Kigali, Rwanda',
  mapLink: 'https://maps.google.com/?q=Kigali',
  hours: [
    ['Monday - Friday', '11:00 - 22:00'],
    ['Saturday', '11:00 - 23:00'],
    ['Sunday', '12:00 - 21:00']
  ],
  currency: 'RWF',
  bookingFrom: '11:00',               // earliest booking time
  bookingTo: '21:00',                 // latest booking time
  maxGuests: 12
};
