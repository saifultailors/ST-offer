import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "সাইফুল টেইলার্স | বিশেষ অফার",
  description: "সাইফুল টেইলার্সের মাসিক ডিসকাউন্ট কুপন",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body>{children}</body></html>;
}
