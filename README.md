# Simple restaurant website

A small, fast restaurant site with:

- **Menu** with categories (loaded from your database, so you can change it any time)
- **Table booking** form (bookings arrive in your Admin page)
- **Opening hours, address, call and WhatsApp buttons**
- **Admin page** (`/admin.html`) to edit the menu and confirm or cancel bookings

No build step, no libraries. It is plain HTML, CSS and JavaScript.
The **database and owner login live on Supabase** and the **website is published free on GitHub Pages**.

```
site/            the website (index.html, admin.html, css/, js/)
supabase/        schema.sql (tables + security rules) and seed.sql (sample menu)
.github/         publishes site/ to GitHub Pages automatically
```

## 1. Supabase (database + owner login), about 5 minutes

1. Go to <https://supabase.com>, create a free account and a **New project** (remember the database password).
2. Open **SQL Editor > New query**, paste all of `supabase/schema.sql`, press **Run**.
   Optional: do the same with `supabase/seed.sql` to get a sample menu.
3. Open **Authentication > Users > Add user > Create new user**. Type **your email and a strong password**, tick "Auto Confirm User". This is your owner login.
4. Open **Authentication > Sign In / Providers** (or *Settings*) and **turn OFF "Allow new users to sign up"**.
   This matters: anyone who is signed in can edit the menu, so only you should have an account.
5. Open **Project Settings > API**. Copy the **Project URL** and the **anon public** key.

## 2. Put your details in the website

Open `site/js/config.js` and fill in:

- `supabaseUrl` and `supabaseAnonKey` (from step 5 above)
- your restaurant name, phone, WhatsApp number, address, opening hours

The anon key is safe to publish. The rules in `schema.sql` mean visitors can only read the menu and send a booking.
**Never** paste the `service_role` key anywhere in this project.

## 3. GitHub (publishes the website)

1. Create a new repository on GitHub and upload this whole folder (or `git init`, `git add .`, `git commit`, `git push`).
   The branch must be called `main`.
2. In the repository open **Settings > Pages**, and under **Source** choose **GitHub Actions**.
3. Open the **Actions** tab. The "Deploy website" job runs by itself; when it is green your site is live at
   `https://YOUR-NAME.github.io/YOUR-REPO/`
   and the owner page is at `.../admin.html`.

Every time you change a file and push, the site updates in about a minute.
(Changing the menu or reading bookings does **not** need a push; do that in the Admin page.)

## Use it every day

- **Admin page > Menu**: add a dish, change a price, switch a dish off when it is finished.
- **Admin page > Bookings**: new requests show a number. Call the guest, then press **Confirm** (or **Cancel**).

## Good to know

- Bookings are *requests*; the restaurant confirms them by phone. There is no automatic SMS or email.
- Supabase free projects pause after a week with no use. If the menu stops loading, open the Supabase dashboard and press **Restore**.
- To use your own domain, add it in GitHub **Settings > Pages**.
- Menu photos: paste a link to an image in the dish form (there is no file upload, to keep it simple).
