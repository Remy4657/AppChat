import type { FriendRequest } from "@/types/user";
import type { ReactNode } from "react";
import UserAvatar from "../chat/UserAvatar";

interface RequestItemProps {
  requestInfo: FriendRequest;
  actions: ReactNode;
  type: "sent" | "received";
}

const FriendRequestItem = ({
  requestInfo,
  actions,
  type,
}: RequestItemProps) => {
  if (!requestInfo) {
    return;
  }
  const info = type === "sent" ? requestInfo.to : requestInfo.from;

  if (!info) {
    return;
  }

  return (
    <div className="flex flex-col border-b border-gray-300 p-3 gap-3">
      <p className="text-gray-800">{requestInfo.message}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            type="sidebar"
            name={info.displayname}
            avatarUrl={info.avatarUrl}
          />
          <div>
            <p className="font-medium">{info.displayname}</p>
            <p className="text-sm text-muted-foreground">@{info.username}</p>
          </div>
        </div>
        {actions}
      </div>
    </div>
  );
};

export default FriendRequestItem;
