import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // Импорт Sonner

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Precious Days Character Sheet",
    description: "Web character sheet for RPG",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <body className={inter.className}>
        {children}
        <Toaster /> {/* <-- Вот он должен быть здесь */}
        </body>
        </html>
    );
}