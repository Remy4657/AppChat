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
  // prev sẽ lấy tin nhắn trước đó trong danh sách messages dựa trên index hiện tại, nếu index + 1 nhỏ hơn độ dài của messages thì sẽ lấy tin nhắn ở vị trí index + 1, ngược lại sẽ là undefined, điều này là do messages được render theo thứ tự ngược (mới nhất ở dưới cùng) nên tin nhắn trước đó sẽ có index lớn hơn tin nhắn hiện tại trong mảng messages
  const prev = index + 1 < messages.length ? messages[index + 1] : undefined;
  // isShowTime = true nếu là tin nhắn cách tin nhắn trước đó hơn 3 phút, khi isShowTime là true thì sẽ hiển thị thời gian gửi tin nhắn ở giao diện để người dùng dễ dàng theo dõi thời gian của các tin nhắn trong cuộc trò chuyện, ngược lại sẽ ẩn để tạo cảm giác liền mạch cho các tin nhắn được gửi liên tiếp trong khoảng thời gian ngắn
  const isShowTime =
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
    180000; // 3 phút
  // isGroupBreak = true nếu là tin nhắn cách tin nhắn trước đó hơn 3 phút hoặc người gửi khác nhau, khi isGroupBreak là true thì sẽ hiển thị avatar và tên người gửi ở giao diện, ngược lại sẽ ẩn để tạo cảm giác liền mạch cho các tin nhắn được gửi liên tiếp bởi cùng một người trong khoảng thời gian ngắn
  const isGroupBreak =
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      60000 || message.senderId !== prev?.senderId;
  //  participant sẽ tìm trong danh sách participants của conversation hiện tại để lấy thông tin của người gửi tin nhắn, thông tin này sẽ được dùng để hiển thị avatar và tên người gửi ở giao diện nếu isGroupBreak là true
  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString()
  );

  return (
    <div>
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
    </div>
  );
};

export default MessageItem;
