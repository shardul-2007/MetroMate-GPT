import type { Metadata } from "next";
import "./globals.css";
import { AppNav } from "@/components/app-nav";
export const metadata: Metadata = { title: "MetroMate GPT", description: "Beyond the metro map" };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body><div className="shell"><AppNav/><main className="main">{children}</main></div></body></html>; }