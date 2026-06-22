"use client";

import * as React from "react";

import { NavUser } from "@/components/sidebar/nav-user";
import CreateNewChat from "@/components/chat/CreateNewChat";
import GroupChatList from "@/components/chat/GroupChatList";
import DirectMessageList from "@/components/chat/DirectMessageList";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bell, Moon, Sun } from "lucide-react";
import ConversationSkeleton from "../skeleton/ConversationSkeleton";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import UserListModal from "../newContact/UserListModal";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import FriendRequestDialog from "../friendRequest/FriendRequestDialog";
import UnreadCountBadge from "../chat/UnreadCountBadge";
import { useFriendStore } from "@/stores/useFriendStore";
import { useNotificationStore } from "@/stores/useNotificationStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const { receivedList } = useFriendStore();
  const { markReadNotification } = useNotificationStore();
  const receivedListUnread = receivedList.filter(
    (item) => item.is_read == false,
  );

  const { convoLoading } = useChatStore();
  const [friendRequestOpen, setfriendRequestOpen] = React.useState(false);
  const handleClickBell = () => {
    setfriendRequestOpen(true);
    markReadNotification();
  };

  return (
    <>
      <Sidebar variant="inset" {...props}>
        {/* Header */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                variant="default"
                size="lg"
                className="hover:bg-background"
              >
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold">QuickChat</h1>
                  <DropdownMenu>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleClickBell()}>
                        <Bell size={16} />
                        <UnreadCountBadge
                          unreadCount={receivedListUnread.length}
                        />
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenu>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent className="beautiful-scrollbar">
          {/* New Chat */}
          <SidebarGroup>
            <SidebarGroupContent>
              <CreateNewChat />
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Group Chat */}
          <SidebarGroup>
            <div className="flex items-center justify-between">
              <SidebarGroupLabel className="uppercase">
                nhóm chat
              </SidebarGroupLabel>
              <NewGroupChatModal isFirstCreateGroup={false} />
            </div>

            <SidebarGroupContent>
              {convoLoading ? <ConversationSkeleton /> : <GroupChatList />}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Dirrect Message */}
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase">bạn bè</SidebarGroupLabel>
            <SidebarGroupAction title="Kết Bạn">
              <UserListModal isFirstCreateDirect={false} />
              {/* <AddFriendModal /> */}
            </SidebarGroupAction>

            <SidebarGroupContent>
              {convoLoading ? <ConversationSkeleton /> : <DirectMessageList />}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      </Sidebar>
      <FriendRequestDialog
        open={friendRequestOpen}
        setOpen={setfriendRequestOpen}
      />
    </>
  );
}
