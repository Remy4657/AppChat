import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { es } from "zod/locales";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    fetchMessages,
  } = useChatStore();
  const [lastMessageStatus, setLastMessageStatus] = useState<
    "delivered" | "seen"
  >("delivered");
  // Lấy mảng messages cho cuộc trò chuyện hiện tại, nếu không có thì trả về mảng rỗng
  const messages = allMessages[activeConversationId!]?.items ?? [];
  // đảo ngược thứ tự messages để hiển thị tin nhắn mới nhất ở dưới cùng
  const reversedMessages = [...messages].reverse();
  // kiểm tra xem còn tin nhắn nào để load thêm không dựa vào hasMore trong store, nếu hasMore là true thì sẽ hiển thị nút load more để người dùng có thể click vào đó để load thêm tin nhắn, nếu hasMore là false thì sẽ không hiển thị nút load more nữa vì đã load hết tin nhắn rồi
  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
  // tìm cuộc trò chuyện đang được chọn dựa vào activeConversationId trong store, nếu không tìm thấy thì trả về null
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId
  );
  // key để lưu vị trí scroll của từng cuộc trò chuyện vào sessionStorage, khi người dùng chuyển sang cuộc trò chuyện khác rồi quay lại thì sẽ lấy vị trí scroll đã lưu để scroll đến đúng vị trí đó thay vì scroll về đầu hoặc cuối của danh sách tin nhắn
  const key = `chat-scroll-${activeConversationId}`;

  // ref
  const messagesEndRef = useRef<HTMLDivElement>(null); // ref để scroll đến cuối danh sách tin nhắn mỗi khi load cuộc trò chuyện mới hoặc gửi tin nhắn mới, messagesEndRef sẽ được gắn vào một div rỗng ở cuối danh sách tin nhắn, khi cần scroll đến cuối thì sẽ gọi messagesEndRef.current.scrollIntoView() để scroll đến div đó
  const containerRef = useRef<HTMLDivElement>(null); // ref để lưu vị trí scroll của danh sách tin nhắn, containerRef sẽ được gắn vào div chứa danh sách tin nhắn, khi người dùng scroll thì sẽ lấy vị trí scroll hiện tại từ containerRef.current.scrollTop để lưu vào sessionStorage, khi load lại cuộc trò chuyện thì sẽ lấy vị trí scroll đã lưu từ sessionStorage để scroll đến đúng vị trí đó

  // seen status
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) {
      return;
    }

    const seenBy = selectedConvo?.seenBy ?? [];
    // eslint-disable-next-line
    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);

  // useLayoutEffect để scroll đến cuối danh sách tin nhắn mỗi khi activeConversationId thay đổi, tức là khi người dùng chuyển sang cuộc trò chuyện khác, useLayoutEffect sẽ được gọi sau khi DOM đã được cập nhật nhưng trước khi trình duyệt vẽ lại giao diện, nên sẽ đảm bảo rằng việc scroll diễn ra trước khi người dùng nhìn thấy giao diện mới, tránh hiện tượng nhảy scroll hoặc scroll không đúng vị trí
  useLayoutEffect(() => {
    if (!messagesEndRef.current) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [activeConversationId]);
  // fetchMoreMessages sẽ được gọi khi người dùng scroll đến đầu danh sách tin nhắn và còn tin nhắn nào để load thêm, hàm này sẽ gọi fetchMessages trong store để fetch thêm tin nhắn cho cuộc trò chuyện hiện tại
  const fetchMoreMessages = async () => {
    if (!activeConversationId) {
      return;
    }
    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error("Lỗi xảy ra khi fetch thêm tin", error);
    }
  };
  // handleScrollSave sẽ được gọi mỗi khi người dùng scroll trong danh sách tin nhắn, hàm này sẽ lấy vị trí scroll hiện tại từ containerRef.current.scrollTop và lưu vào sessionStorage với key là `chat-scroll-${activeConversationId}`, khi load lại cuộc trò chuyện thì sẽ lấy vị trí scroll đã lưu từ sessionStorage để scroll đến đúng vị trí đó
  const handleScrollSave = () => {
    const container = containerRef.current;
    if (!container || !activeConversationId) {
      return;
    }

    sessionStorage.setItem(
      key,
      JSON.stringify({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      })
    );
  };
  // useLayoutEffect để lấy vị trí scroll đã lưu từ sessionStorage mỗi khi messages.length thay đổi, tức là mỗi khi có tin nhắn mới được load hoặc gửi đi, useLayoutEffect sẽ được gọi sau khi DOM đã được cập nhật nhưng trước khi trình duyệt vẽ lại giao diện, nên sẽ đảm bảo rằng việc scroll diễn ra trước khi người dùng nhìn thấy giao diện mới, tránh hiện tượng nhảy scroll hoặc scroll không đúng vị trí
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const item = sessionStorage.getItem(key);

    if (item) {
      const { scrollTop } = JSON.parse(item);
      requestAnimationFrame(() => {
        container.scrollTop = scrollTop;
      });
    }
  }, [messages.length]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  if (!messages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground ">
        Chưa có tin nhắn nào trong cuộc trò chuyện này.
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div
        id="scrollableDiv"
        ref={containerRef}
        onScroll={handleScrollSave}
        className="flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar"
      >
        <div ref={messagesEndRef}></div>
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMoreMessages}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={<p>Đang tải...</p>}
          inverse={true}
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            overflow: "visible",
          }}
        >
          {reversedMessages.map((message, index) => (
            <MessageItem
              key={message._id ?? index}
              message={message}
              index={index}
              messages={reversedMessages}
              selectedConvo={selectedConvo}
              lastMessageStatus={lastMessageStatus}
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default ChatWindowBody;
