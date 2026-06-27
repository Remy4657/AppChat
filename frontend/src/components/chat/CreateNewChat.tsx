import { useFriendStore } from "@/stores/useFriendStore";
import { Card } from "../ui/card";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { MessageCircle, Search, Plus } from "lucide-react";
import FriendListModal from "../createNewChat/FriendListModal";

const CreateNewChat = () => {
  const { getFriends } = useFriendStore();

  const handleGetFriends = async () => {
    await getFriends();
  };

  return (
    <div className="flex gap-2">
      <Card
        className="flex-1 p-3 glass hover:shadow-soft transition-smooth cursor-pointer group/card"
        onClick={handleGetFriends}
      >
        <Dialog>
          <DialogTrigger>
            <div className="flex items-center gap-2 cursor-pointer justify-between">
              <div className="flex flex-row gap-2">
                <div className="size-5 flex items-center justify-center group-hover/card:scale-110 transition-bounce">
                  <Search className="size-4 " />
                </div>
                <span className="text-sm font-medium capitalize">
                  Tin nhắn mới
                </span>
              </div>

              <div className="size-5 rounded-full flex items-center justify-center group-hover/card:scale-110 transition-bounce">
                <Plus className="size-4" />
              </div>
            </div>
          </DialogTrigger>

          <FriendListModal />
        </Dialog>
      </Card>
    </div>
  );
};

export default CreateNewChat;
