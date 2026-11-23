# XFree Studio — hackathon launch checklist

- [ ] Confirm Firebase project `xfree-studio` and register the Web app
- [ ] Enable Google + Email/Password; configure authorized domains
- [ ] Review Phone Auth SMS/billing limitations before enabling
- [ ] Create Firestore production database and deploy `firestore.rules`
- [ ] Run two-user access-denial and anonymous access tests
- [ ] Configure public `VITE_FIREBASE_*` values in build environment
- [ ] Run frontend build, Rust checks and security CI
- [ ] Deploy Firebase Hosting SPA and verify `/` and `/studio`
- [ ] Test sign-in/out, local editing, explicit cloud save/load and mobile layout
- [ ] Verify AI inference and App Check before advertising AI as live
- [ ] Record demo and capture real deployment URL, test results and known limitations
- [ ] Confirm all enabled services remain within the chosen billing plan

See [zero-cost infrastructure plan](ZERO-COST-INFRASTRUCTURE.md).
