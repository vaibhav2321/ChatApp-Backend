import { json } from "express";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    cloudinary

    try {
        // Validate inputs
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
        });

        // Save the user and generate token
        await newUser.save();
        generateToken(newUser._id, res);

        // Respond with the created user details
        return res.status(201).json({
            _id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
            profilePic: newUser.profilePic || null, // Fallback to null if profilePic is undefined
        });
    } catch (error) {
        console.error("Error in signup controller:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid credentialsss1" });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentialsss" });
      }
  
      generateToken(user._id, res);
  
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    } catch (error) {
      console.error("Error in login controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt","", { MaxAge: 0 });
        res.status(200).json({message: "Logged out successfully!"})
    } catch (error) {
        console.error("Error in logout controller: ", error);
        res.status(500).json({message: "Internal Server Error."})
    }
};

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile Pic is required." });
      }
  
      // Upload profile picture to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
  
      // Update user in the database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error in updateProfile controller: ", error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  };

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error in checkAuth controller: ", error);
        res.status(500),json({message: "Internal Server Error"})
        
    }
}
