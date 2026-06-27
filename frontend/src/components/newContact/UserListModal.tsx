"use client";
import { useFriendStore } from "@/stores/useFriendStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  MessageCircleMore,
  UserPlus,
  Users,
  PlusIcon,
  User,
} from "lucide-react";
import { Card } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { toast } from "sonner";

const UserListModal = (props: { isFirstCreateDirect: boolean }) => {
  const { isFirstCreateDirect } = props;
  const { listAllUsers, addFriend, declineRequest, acceptRequest } =
    useFriendStore();

  const handleSend = async (userId: string) => {
    try {
      const message = await addFriend(userId);
      toast.success(message);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const handleDecline = async (requestId: string) => {
    try {
      await declineRequest(requestId);
      toast.info("Đã từ chối kết bạn");
    } catch (error) {
      console.error(error);
    }
  };
  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      toast.success("Đã đồng ý kết bạn thành công");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Dialog>
      <DialogTrigger
        render={(triggerProps) => {
          if (isFirstCreateDirect) {
            return (
              <div className="flex items-center justify-center flex-col">
                <h1 className="">Chưa có bạn bè, kết bạn ngay để chat</h1>
                <Button {...triggerProps} className="mt-2" variant="primary">
                  Tạo liên hệ
                </Button>
              </div>
            );
          }
          return (
            <Button
              {...triggerProps}
              variant="ghost"
              className="flex z-10 justify-center items-center size-5 rounded-full hover:bg-sidebar-accent transition"
            >
              <UserPlus className="size-4" />
              <span className="sr-only">Kết bạn</span>
            </Button>
          );
        }}
      />
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl capitalize">
            <MessageCircleMore className="size-5" />
            Tạo liên hệ mới
          </DialogTitle>
        </DialogHeader>

        {/* friends list */}
        <div className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {listAllUsers
              .filter(
                (user) => !user.isFriend && user.isReceivedRequest === false,
              )
              .map((u) => (
                <Card
                  key={u._id}
                  className="p-3 cursor-pointer transition-smooth hover:shadow-soft glass hover:bg-muted/30 group/friendCard flex flex-row items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {/* avatar */}
                    <div className="relative">
                      <UserAvatar
                        type="sidebar"
                        name={u.displayname}
                        avatarUrl={u.avatarUrl || ""}
                      />
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h2 className="font-semibold text-sm truncate">
                        {u.displayname}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        @{u.username}
                      </span>
                    </div>
                  </div>
                  <div>
                    {u.isReceivedRequest === false &&
                      u.isSentRequest === false &&
                      u.isFriend === false && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleSend(u._id)}
                        >
                          <PlusIcon className="size-3 mr-0" />
                          Thêm bạn bè
                        </Button>
                      )}
                    {u.isReceivedRequest === false &&
                      u.isSentRequest === true &&
                      u.isFriend === false && <span>Đã gửi lời mời...</span>}
                  </div>
                </Card>
              ))}

            {listAllUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="size-12 mx-auto mb-3 opacity-50" />
                Danh sách trống
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserListModal;
