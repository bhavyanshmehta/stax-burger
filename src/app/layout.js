import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "STAX — Flame Crafted Burgers",
  description: "Experience STAX: a premium, interactive digital showcase of flame-crafted burgers built with artisanal ingredients and finished over real fire.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-black text-[#F5EBDC] font-body flex flex-col m-0 p-0 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
