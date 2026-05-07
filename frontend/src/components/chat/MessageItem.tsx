import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const prev = index + 1 < messages.length ? messages[index + 1] : undefined;
  // isShowTime nếu là tin nhắn đầu tiên hoặc cách tin nhắn trước đó hơn 5 phút
  const isShowTime =
    index === 0 ||
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000; // 5 phút
  // isGroupBreak nếu là tin nhắn đầu tiên hoặc cách tin nhắn trước đó hơn 5 phút hoặc người gửi khác nhau, khi isGroupBreak là true thì sẽ hiển thị avatar và tên người gửi ở giao diện, ngược lại sẽ ẩn để tạo cảm giác liền mạch cho các tin nhắn được gửi liên tiếp bởi cùng một người trong khoảng thời gian ngắn
  const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;
  //  participant sẽ tìm trong danh sách participants của conversation hiện tại để lấy thông tin của người gửi tin nhắn, thông tin này sẽ được dùng để hiển thị avatar và tên người gửi ở giao diện nếu isGroupBreak là true
  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString()
  );

  return (
    <>
      {/* time */}
      {isShowTime && (
        <span className="flex justify-center text-xs text-muted-foreground px-1">
          {formatMessageTime(new Date(message.createdAt))}
        </span>
      )}

      <div
        className={cn(
          "flex gap-2 message-bounce mt-1",
          message.isOwn ? "justify-end" : "justify-start"
        )}
      >
        {/* avatar */}
        {/* nếu tin nhắn không phải do người dùng hiện tại gửi ra thì mới hiển thị avatar, nếu isGroupBreak là true thì sẽ hiển thị avatar và tên người gửi, ngược lại sẽ ẩn để tạo cảm giác liền mạch cho các tin nhắn được gửi liên tiếp bởi cùng một người trong khoảng thời gian ngắn */}
        {!message.isOwn && (
          <div className="w-8">
            {isGroupBreak && (
              <UserAvatar
                type="chat"
                name={participant?.displayName ?? "QuickChat"}
                avatarUrl={participant?.avatarUrl ?? undefined}
              />
            )}
          </div>
        )}

        {/* tin nhắn */}
        <div
          className={cn(
            "max-w-xs lg:max-w-md space-y-1 flex flex-col",
            message.isOwn ? "items-end" : "items-start"
          )}
        >
          <Card
            className={cn(
              "p-3",
              message.isOwn
                ? "chat-bubble-sent border-0"
                : "chat-bubble-received"
            )}
          >
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </Card>

          {/* seen  delivered  */}
          {/* chỉ hiển thị trạng thái seen/delivered cho tin nhắn cuối cùng của 
          cuộc trò chuyện và chỉ hiển thị với tin nhắn do người dùng hiện tại gửi ra, 
          nếu tin nhắn đó đã được xem bởi người nhận thì sẽ hiển thị "seen" với màu 
          primary, ngược lại sẽ hiển thị "delivered" với màu muted */}
          {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0",
                lastMessageStatus === "seen"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {lastMessageStatus}
            </Badge>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageItem;
