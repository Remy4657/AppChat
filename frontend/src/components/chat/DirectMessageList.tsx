import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";
import { Button } from "../ui/button";
import UserListModal from "../newContact/UserListModal";

const DirectMessageList = () => {
  const { conversations } = useChatStore();
  if (!conversations) return;

  const directConversations = conversations.filter(
    (convo) => convo.type === "direct",
  );
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
