🚀 Fiverr Gig Delivery Process: AstroIsland Template

1. Project Initialization
[ ] Update src/data/business.json with client details (Name, Hero, Features).

[ ] Choose a vibe: "dark-neo" or "clean-light".

[ ] Drop client images into src/assets/client/.

[ ] Update src/data/business.json image paths to match filenames exactly.

2. Branding & Content
[ ] Update brand.name in JSON (affects Title, Header, and Footer).

[ ] Run npm run dev and check for any "Missing Image" placeholders.

[ ] Check color contrast (Ensure var(--accent) is readable on background).

3. Performance & SEO Check
[ ] Run npm run build locally to ensure no broken image paths.

[ ] Verify FeatureImage.astro is generating .webp versions in the dist folder.

[ ] Check Meta Tags in src/layouts/Layout.astro (Title/Description).

4. Deployment (Netlify)
[ ] Commit and Push to GitHub: git add . && git commit -m "feat: client update" && git push.

[ ] Verify build success in Netlify Dashboard.

[ ] Forms: Go to Netlify -> Forms and ensure the "contact" form is detected.

[ ] Optimization: Enable "Image Optimization" and "Minification" in Netlify build settings.

5. Delivery to Client
[ ] Generate Lighthouse Report (Target: 95-100 across the board).

[ ] Send live URL + Lighthouse Screenshot to client.

[ ] (Optional) Provide instructions for Netlify Form notification settings.

Pro Tip for Fiverr:
When you deliver the order, include the Lighthouse Score screenshot. Clients on Fiverr love seeing that "All Green" circle 100/100; it justifies the price of a modern static site over a slow WordPress site.

Would you like me to help you write a "Technical Specifications" snippet? You can paste it into your Fiverr Gig description to explain why your sites are faster than the competition.