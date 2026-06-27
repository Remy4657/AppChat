"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronsUpDownIcon,
  BellIcon,
  UserIcon,
  LogOutIcon,
  Sun,
  Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import ProfileDialog from "../profile/ProfileDialog";
import { useThemeStore } from "@/stores/useThemeStore";

export function NavUser({
  user,
}: {
  user: {
    email: string;
    displayname: string;
    username: string;
    avatarUrl?: string | null;
  };
}) {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const { isMobile } = useSidebar();
  const [friendRequestOpen, setfriendRequestOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {}
  };
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="aria-expanded:bg-muted"
                />
              }
              className="cursor-pointer"
            >
              <Avatar>
                <AvatarImage
                  src={user.avatarUrl ?? ""}
                  alt={user.displayname}
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.displayname}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar>
                      <AvatarImage
                        src={user.avatarUrl ?? ""}
                        alt={user.displayname}
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user.displayname ?? user.username}
                      </span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <UserIcon className="text-muted-foreground dark:group-focus:!text-accent-foreground" />
                  Tài Khoản
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={() => setfriendRequestOpen(true)}>
                  <BellIcon className="text-muted-foreground dark:group-focus:!text-accent-foreground" />
                  Thông Báo
                </DropdownMenuItem> */}
                {isDark ? (
                  <DropdownMenuItem onClick={() => toggleTheme()}>
                    <Sun className="size-4 text-muted-foreground" />
                    Chế độ sáng
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => toggleTheme()}>
                    <Moon className="size-4 text-muted-foreground" />
                    Chế độ tối
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ProfileDialog open={profileOpen} setOpen={setProfileOpen} />
    </>
  );
}
