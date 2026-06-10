"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";
import UserListModal from "../newContact/UserListModal";
import { SkeletonCard } from "../skeleton/SkeletonCard";

const DirectMessageList = () => {
  const { conversations } = useChatStore();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  if (!conversations) return;

  const directConversations = conversations.filter(
    (convo) => convo.type === "direct",
  );
  if (loading) {
    return Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />);
  }
  if (directConversations.length == 0) {
    return <UserListModal isFirstCreateDirect={true} />;
  }
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversations.map((convo) => (
        <DirectMessageCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default DirectMessageList;
