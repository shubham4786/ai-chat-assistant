import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        const userId = session.user.id;
        
        // Find all chats by the user
        const userChats = await Chat.find({ user: userId });
        const chatIds = userChats.map(chat => chat._id);

        // Delete all messages in those chats
        await Message.deleteMany({ chat: { $in: chatIds } });

        // Delete all chats of the user
        await Chat.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting account:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
