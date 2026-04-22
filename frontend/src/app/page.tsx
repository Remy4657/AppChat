"use client";
import Image from "next/image";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import ChatWindowLayout from "@/components/chat/ChatWIndowLayout";

export default function Home() {
  const router = useRouter();
  const { signOut, fetchMe, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {}
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex h-screen w-full p-2">
        <ChatWindowLayout />
      </div>
    </SidebarProvider>
  );
}
