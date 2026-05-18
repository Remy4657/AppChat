import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create<ChatState>()(
  persist(
    // persist middleware của zustand sẽ tự động lưu state vào localStorage và load lại state từ localStorage khi khởi tạo store, trong trường hợp này thì chỉ lưu conversations vào localStorage để khi reload trang thì vẫn giữ được danh sách cuộc trò chuyện
    (set, get) => ({
      conversations: [], // lưu danh sách cuộc trò chuyện của người dùng
      messages: {}, // lưu messages của các cuộc trò chuyện, messages sẽ được lưu theo dạng object với key là conversationId và value là object chứa items (danh sách message đã fetch được), hasMore (boolean để biết còn message nào để fetch tiếp hay không), nextCursor (cursor để fetch tiếp nếu hasMore là true)
      activeConversationId: null, // thuộc tính này để lưu id của cuộc trò chuyện đang được mở, khi activeConversationId thay đổi thì component chat sẽ tự động fetch messages cho cuộc trò chuyện đó
      convoLoading: false, // convo loading
      messageLoading: false,
      loading: false,
      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          // fetchConversations sẽ trả về danh sách cuộc trò chuyện của người dùng, người dùng được xác định bằng access token gửi kèm trong header của request, nên không cần truyền userId vào hàm này
          const { conversations } = await chatService.fetchConversations();

          set({ conversations, convoLoading: false });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchConversations:", error);
          set({ convoLoading: false });
        }
      },
      // fetchMessages được gọi khi activeConversationId thay đổi hoặc khi người dùng
      // click vào nút load more để fetch thêm messages cho cuộc trò chuyện đó, sau khi fetch
      //xong thì sẽ merge messages mới fetch được với messages đã có trong store
      //cho cuộc trò chuyện đó (nếu đã có), đồng thời cập nhật hasMore và
      //nextCursor dựa vào dữ liệu trả về từ API để biết còn message nào để
      //fetch tiếp hay không
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return;

        const current = messages?.[convoId]; // lấy messages đã lưu trong store cho conversation này nếu có (nghĩa là trước đó nếu user bấm vào conv để xem tin nhắn prevItems sẽ có), nếu chưa có thì sẽ là mảng rỗng
        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor; // nếu nextCursor trong store là undefined nghĩa là chưa từng fetch messages cho conversation này bao giờ thì sẽ set nextCursor thành empty string để fetch từ đầu, nếu đã từng fetch rồi thì sẽ lấy nextCursor từ store để fetch tiếp, nếu nextCursor trong store là null nghĩa là đã fetch hết messages cho conversation này rồi thì sẽ không fetch nữa nên return luôn

        if (nextCursor === null) return;

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );
          // xử lý dữ liệu để thêm thuộc tính isOwn vào mỗi message, isOwn sẽ được dùng để phân biệt message nào là của người dùng hiện tại gửi ra để hiển thị ở giao diện
          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));

          set((state) => {
            // nếu đã có messages cho conversation này trong store thì sẽ merge messages mới fetch được với messages đã có, nếu chưa có thì sẽ dùng messages mới fetch được
            const prev = state.messages[convoId]?.items ?? [];
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed; // cho trường hợp cuộn xem lịch sử, còn khi mở cuộc trò chuyện lần đầu thì prev sẽ được fetch từ db
            // hasMore sẽ được set thành true nếu còn cursor để fetch tiếp, nếu không còn cursor nào nữa thì set thành false để giao diện biết là đã load hết messages và không cần hiển thị nút load more nữa
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchMessages:", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
          );
          // khi gửi tin nhắn mới thì sẽ reset seenBy của cuộc trò chuyện đó về rỗng để hiển thị trạng thái chưa xem cho những người tham gia khác, khi người dùng khác mở cuộc trò chuyện đó lên thì sẽ gọi API markAsSeen để cập nhật seenBy và hiển thị trạng thái đã xem ở giao diện
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gửi direct message", error);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl);
          // khi gửi tin nhắn mới thì sẽ reset seenBy của cuộc trò chuyện đó về rỗng để hiển thị trạng thái chưa xem cho những người tham gia khác, khi người dùng khác mở cuộc trò chuyện đó lên thì sẽ gọi API markAsSeen để cập nhật seenBy và hiển thị trạng thái đã xem ở giao diện
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra gửi group message", error);
        }
      },
      // hàm addMessage này sẽ được gọi khi nhận được sự kiện "new-message" từ socket, message được truyền vào hàm này là message mới được gửi ra từ server, hàm này sẽ thêm message mới vào store để giao diện tự động cập nhật mà không cần phải fetch lại toàn bộ messages của cuộc trò chuyện đó, nếu message đã tồn tại trong store rồi thì sẽ không thêm nữa để tránh trùng lặp
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          message.isOwn = message.senderId === user?._id;

          const convoId = message.conversationId;
          // lấy messages đã lưu trong store cho conversation này nếu có (nghĩa là trước đó nếu user bấm vào conv để xem tin nhắn prevItems sẽ có), nếu chưa có thì sẽ là mảng rỗng
          let prevItems = get().messages[convoId]?.items ?? [];
          // đảm bảo rằng nếu prevItems đang là mảng rỗng thì sẽ fetch messages cho conversation này để lấy về những messages đã có trong database, tránh trường hợp khi nhận được message mới mà prevItems đang là mảng rỗng thì sẽ thêm message mới vào store nhưng những messages cũ đã có trong database lại không có trong store nên sẽ bị mất những messages cũ đó đi, sau khi fetch xong thì sẽ lấy lại prevItems từ store để tiếp tục xử lý
          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId);
            prevItems = get().messages[convoId]?.items ?? [];
          }

          set((state) => {
            // kiểm tra nếu tin nhắn sắp được thêm vào đã có trong db chưa, nếu có rồi thì sẽ không thêm nữa để tránh trùng lặp
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId].hasMore,
                  nextCursor: state.messages[convoId].nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy khi ra add message:", error);
        }
      },
      updateConversation: (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c,
          ),
        }));
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();

          if (!activeConversationId || !user) {
            return;
          }

          const convo = conversations.find(
            (c) => c._id === activeConversationId,
          );

          if (!convo) {
            return;
          }

          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
            return;
          }
          // gọi API để đánh dấu tin nhắn đã được xem, API này sẽ cập nhật seenBy và unreadCounts ở backend
          // backend cũng phát sự kiện "read-message" để thông báo cho những người tham gia khác trong cuộc trò chuyện đó biết là đã có tin nhắn được đánh dấu là đã xem, từ đó cập nhật lại trạng thái seen và unreadCounts ở giao diện của những người tham gia khác
          await chatService.markAsSeen(activeConversationId);
          // cập nhật lại unreadCounts trong store
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCounts: {
                      ...c.unreadCounts,
                      [user._id]: 0,
                    },
                  }
                : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gọi markAsSeen trong store", error);
        }
      },
      addConvo: (convo) => {
        set((state) => {
          const exists = state.conversations.some(
            (c) => c._id.toString() === convo._id.toString(),
          );

          return {
            conversations: exists
              ? state.conversations
              : [convo, ...state.conversations],
            activeConversationId: convo._id,
          };
        });
      },
      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds,
          );
          get().addConvo(conversation);
          // sau khi tạo xong cuộc trò chuyện (group hoặc direct ở chức năng tạo nhóm hoặc "Gửi tin nhắn mới") thì tự động join vào phòng của cuộc trò chuyện đó luôn để nhận/gửi tin nhắn
          useSocketStore
            .getState()
            .socket?.emit("join-conversation", conversation._id);
        } catch (error) {
          console.error(
            "Lỗi xảy ra khi gọi createConversation trong store",
            error,
          );
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);
