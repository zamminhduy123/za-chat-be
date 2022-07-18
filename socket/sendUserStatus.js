const conversationModel = require("../models/conversation.model")

module.exports = { 
    online: async (username, userSocketMap) => {
        const userConversations = await conversationModel.getByUsername(username);
        for (const conv of userConversations){
            const members = await memberModel.getMemberByConversationId(conv.id);
            if (members.length === 2){
                const otherUser = members[0] === username ? members[0] : members[1];
                const otherUserSocket = userSocketMap.get(otherUser);
                if (otherUserSocket){
                    otherUserSocket.emit("USER_ONLINE", )
                }
            }
            
        }
    },
    offline: async (username, userSocketMap) => {
        const userConversations = await conversationModel.getByUsername(username);
        for (const conv of userConversations){
            const members = await memberModel.getMemberByConversationId(conv.id);
            if (members.length === 2){
                const otherUser = members[0] === username ? members[0] : members[1];
                const otherUserSocket = userSocketMap.get(otherUser);
                if (otherUserSocket){
                    otherUserSocket.emit("USER_ONLINE", )
                }
            }
        }
    }
}