import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIAR | Administración de restaurantes",
  description: "Sistema Integral de Administración para Restaurantes"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
