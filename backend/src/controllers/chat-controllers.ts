import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureGemini } from "../config/gemini-config.js";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });
    }

    // Get previous chats
    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    }));

    // Add new user message
    chats.push({
      role: "user",
      content: message,
    });

    // Save user message
    user.chats.push({
      role: "user",
      content: message,
    });

    // Configure Gemini
    const gemini = configureGemini();

    // Convert chats to Gemini format
    const contents = chats.map((chat) => ({
      role: chat.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: chat.content,
        },
      ],
    }));

    // Send request to Gemini
    const chatResponse = await gemini.models.generateContent({
     model: "gemini-3.6-flash",
      contents,
    });

    // Get Gemini response
    const assistantMessage = chatResponse.text || "";

    // Save Gemini response
    user.chats.push({
      role: "assistant",
      content: assistantMessage,
    });

    await user.save();

    return res.status(200).json({
      chats: user.chats,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .send("User not registered OR Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    return res.status(200).json({
      message: "OK",
      chats: user.chats,
    });
  } catch (error) {
    console.log(error);

    return res.status(200).json({
      message: "ERROR",
      cause: error.message,
    });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .send("User not registered OR Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    //@ts-ignore
    user.chats = [];

    await user.save();

    return res.status(200).json({
      message: "OK",
    });
  } catch (error) {
    console.log(error);

    return res.status(200).json({
      message: "ERROR",
      cause: error.message,
    });
  }
};