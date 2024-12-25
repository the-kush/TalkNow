import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUser } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (e){
        console.error("User Side bar error ", e.message);
    }
}

export const getMessages = async (req, res) => {

    try {
        const {id:userToChatId} = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:senderId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:senderId}
            ]
        })
        res.status(200).json(messages);
    } catch (e) {
        console.error("Error getting messages", e.message);
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save();

        // realtime functionality goes here => socket.io

        res.status(201).json(newMessage);
    } catch (e){
        console.error("Error sending message", e.message);
        res.status(400).json({error: e});
    }
}