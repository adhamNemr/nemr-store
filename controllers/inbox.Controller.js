const Message = require("../models/message.model");

// جلب كل المحادثات الخاصة بمستخدم
exports.getConversations = async (req, res) => {
  const userId = req.user.id;
  const { Op } = require("sequelize");

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      order: [["createdAt", "DESC"]]
    });

    // تجميع المحادثات حسب الطرف الآخر (الطرف المتحدث معه)
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          latestMessage: msg,
          unreadCount: 0
        });
      }

      // زيادة عدد الرسائل غير المقروءة إذا كان المستخدم هو المستقبل ولم يقرأ الرسالة
      if (msg.receiverId === userId && !msg.read) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    // تحويل الـ Map إلى Array لإرسالها للواجهة
    const conversations = Array.from(conversationsMap.entries()).map(([userId, data]) => ({
      userId,
      latestMessage: data.latestMessage,
      unreadCount: data.unreadCount
    }));

    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching messages." });
  }
};

// إرسال رسالة
exports.sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user.id;

  try {
    const newMessage = await Message.create({ senderId, receiverId, text });
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while sending message." });
  }
};

// جلب كل الرسائل بين المستخدم الحالي ومستخدم آخر
exports.getMessagesWithUser = async (req, res) => {
  const userId = req.user.id;
  const otherUserId = req.params.userId;
  const { Op } = require("sequelize");

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      order: [["createdAt", "ASC"]]
    });
    // تحديث حالة الرسائل إلى مقروءة
    await Message.update(
      { read: true },
      {
        where: {
          senderId: otherUserId,
          receiverId: userId,
          read: false
        }
      }
    );
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching messages with user." });
  }
};