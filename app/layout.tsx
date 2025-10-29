import type { Metadata } from "next";
import "../styles/globals.css";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: "Lumeron - Rave Sticker Shop",
  description: "Custom rave stickers with AI-generated designs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
