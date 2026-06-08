import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";
import NewGroupChatModal from "./NewGroupChatModal";

const GroupChatList = () => {
  const { conversations } = useChatStore();

  if (!conversations) return;

  const groupchats = conversations.filter((convo) => convo.type === "group");

  if (groupchats.length == 0) {
    return <NewGroupChatModal isFirstCreateGroup={true} />;
  }
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {groupchats.map((convo) => (
        <GroupChatCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default GroupChatList;
