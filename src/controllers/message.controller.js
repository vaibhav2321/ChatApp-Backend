import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";


export const getUsersForSidebar =  async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUser = await User.find({ _id: { $ne: loggedInUserId }}).select("-password");

        res.status(200).json({filteredUser});
    } catch (error) {
        console.error("Error in getUsersForSidebar controller: ", error);
        res.status(500).json({error: "Internal Server Error."})
    }
};

export const getMessages = async (req, res) => {
    try {
        const {id: userToChatId} = req.params;
        const myId = req.user._id;

        const message = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        })

        res.status(200).json(message)
    } catch (error) {
        console.error("Error in getMessage controller: ", error);
        res.status(500).json({error: "Internal Server Error."})
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params;
        const senderId = req.user._id;

        // if message is image
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            image = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl || null
        })

        await newMessage.save()

        // real time functionality goes here using socket.io

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error);
        res.status(500).json({error: error});
    }
}