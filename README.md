# CS AD-PRO

**AI-powered CS:GO/CS2 skin advertisement creator.**
Create professional social media assets for skin sales in seconds using Generative AI.

![Project Banner](https://placehold.co/1200x400/09090b/ea580c?text=CS+AD-PRO)

## 🚀 Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Prisma](https://www.prisma.io/) (SQLite for Dev, PostgreSQL for Prod)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI**: [Google Gemini 2.0 Flash](https://ai.google.dev/) (Text & Image Generation)
- **Deployment**: Vercel

## ✨ Features

- **Skin Catalog**: Quick search for any CS:GO/CS2 skin.
- **Auto-Prompt Engine**: Analyzes skin properties to generate high-converting ad copy.
- **Visual Generator**: Creates stunning backgrounds and compositions using Gemini AI.
- **Style Templates**:
  - 🎯 **Minimal**: Clean focus on the skin.
  - 💰 **Retail**: Price and float highlights.
  - 🏆 **Esports**: Official drop style.
  - 💬 **Engagement**: "Would you own this?" polls.
  - ❓ **Post-Match**: "How was the match?" engagement.
  - ⚔️ **VS Float**: Before/After comparison.
- **History Persistence**: All campaigns are saved automatically to the database.

## 🛠️ Setup Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GabrielMBatista/cs-ad-pro.git
   cd cs-ad-pro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env.local` and add your keys:
   ```env
   NEXT_PUBLIC_API_KEY=your_gemini_api_key
   DATABASE_URL="file:./dev.db"
   ```

4. **Setup Database:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Access at `http://localhost:3000`.

## 📦 Deployment (Vercel)

1. Import this repository on [Vercel](https://vercel.com/).
2. Add Environment Variables:
   - `NEXT_PUBLIC_API_KEY`
   - `DATABASE_URL` (Use a PostgreSQL provider like [Neon](https://neon.tech/))
3. **Important**: Change `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"` before deploying if using Neon/Vercel Postgres.

## 📄 License

MIT
