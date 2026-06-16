import { promises } from "dns";
import { Badge } from "../ui/badge";

const UnreadCountBadge = ({ unreadCount }: { unreadCount: number }) => {
  if (unreadCount === 0) return null;
  return (
    <div className="pulse-ring absolute z-20 -top-1 -right-1">
      <Badge className="size-5 text-xs bg-gradient-chat border border-background">
        {unreadCount > 9 ? "9+" : unreadCount}
      </Badge>
    </div>
  );
};

export default UnreadCountBadge;
