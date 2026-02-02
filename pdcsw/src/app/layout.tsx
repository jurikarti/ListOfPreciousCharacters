import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
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
        <html lang="ru" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster /> {/* <-- Вот он должен быть здесь */}
                </ThemeProvider>
            </body>
        </html>
    );
}