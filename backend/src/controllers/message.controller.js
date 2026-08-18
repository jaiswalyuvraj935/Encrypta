import User from "../models/user.model.js"

export const getUsersforSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json({ filteredUsers });
    }
    catch (error) {
        console.error("Error in getUsersforSidebar", error.message);
        res.status(500).json({ error: "internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await MessageChannel.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }); // Sorts messages from oldest to newest

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Validation: Don't allow empty messages
        if (!text && !image) {
            return res.status(400).json({ error: "Message must contain either text or an image." });
        }

        let imageUrl = null;

        // If an image is provided (base64 or file path), upload to Cloudinary
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Create new message document
        const newMessage = new Message({
            senderId,
            receiverId,
            text: text || "",
            image: imageUrl,
        });

        await newMessage.save();

        // Optional: Send message in real-time via Socket.IO if receiver is online
        

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};