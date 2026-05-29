"use client";
import { cn } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { chatService } from "@/services/chatService";

interface MessageItemProps {
  message: Message;
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageContent = ({
  message,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleRetrieveMessage = () => {
    const messageId = message._id;
    chatService.retrieveMessage(messageId);
    setPopoverOpen(false);
  };
  return (
    <div
      className={cn(
        "max-w-xs lg:max-w-md space-y-1 flex flex-col",
        message.isOwn ? "items-end" : "items-start",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPopoverOpen(false); // tự động đóng popover khi rời chuột
      }}
    >
      {/* Bọc Card + nút ba chấm trong relative container */}
      <div
        className={cn(
          "relative",
          message.isOwn && "pl-8", // chừa chỗ bên trái cho button 3 chấm
        )}
      >
        <Card
          className={cn(
            "p-3",
            message.isOwn
              ? "chat-bubble-sent border-0"
              : "chat-bubble-received",
          )}
        >
          <p
            className={cn(
              "text-sm leading-relaxed break-words",
              message.deleted_at ? "italic" : null,
            )}
          >
            {message.deleted_at ? "Tin nhắn đã được thu hồi" : message.content}
          </p>
          {/* Nút ba chấm chỉ hiện khi hover + tin nhắn của mình */}
          {message.isOwn && isHovered && !message.deleted_at && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger className="absolute cursor-pointer bottom-0 left-0 w-6 h-6 rounded-full bg-background border shadow-sm flex items-center justify-center hover:bg-accent transition-colors">
                {/* <button
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
                onClick={(e) => e.stopPropagation()} // tránh sự kiện nổi bọt
              > */}
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                {/* </button> */}
              </PopoverTrigger>
              <PopoverContent align="end" side="top" className="w-40 p-1">
                <div className="flex flex-col">
                  {/* <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md">
                    Chỉnh sửa
                  </button> */}
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md text-destructive cursor-pointer"
                    onClick={() => handleRetrieveMessage()}
                  >
                    Thu hồi
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </Card>
      </div>
      {/* Badge trạng thái (giữ nguyên) */}
      {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-1.5 py-0.5 h-4 border-0",
            lastMessageStatus === "seen"
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {lastMessageStatus}
        </Badge>
      )}
    </div>
  );
};

export default MessageContent;
