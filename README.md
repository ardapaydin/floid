# Floid

Floid is a simple proprietary social news and forum social media platform.

## Self Host

1. **Clone Repo**

   ```bash
   git clone https://github.com/ardapaydin/floid.git
   cd floid
   npm i // install dependencies
   ```

2. **Configure Environment Variables**
   Create a `.env` files in server and client directories and add the necessary environment variables. You can refer to `.env.example` files for guidance..

3. **Development**

   ```bash
   npm run dev
   // Client: http://localhost:5173
   ```

4. **Production Build**

   ```bash
   npm run build
   npm start
   ```

5. **Deploy**
   Deploy to your favorite platform like Cloudflare Pages and Github Pages for clientside.
