import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

export async function PATCH(req: NextRequest, context: { params: Promise<{ chatId: string }> }) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title } = await req.json();
        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        await connectToDB();

        const chat = await Chat.findById(params.chatId);

        if (!chat || chat.user.toString() !== session.user.id) {
            return NextResponse.json({ error: "Chat not found or access denied" }, { status: 404 });
        }

        chat.title = title;
        await chat.save();

        return NextResponse.json(chat, { status: 200 });

    } catch (error) {
        console.error("Error updating chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ chatId: string }> }) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        const chat = await Chat.findById(params.chatId);

        if (!chat || chat.user.toString() !== session.user.id) {
            return NextResponse.json({ error: "Chat not found or access denied" }, { status: 404 });
        }

        // Delete all messages in the chat
        await Message.deleteMany({ chat: params.chatId });

        // Delete the chat itself
        await Chat.findByIdAndDelete(params.chatId);

        return NextResponse.json({ message: "Chat deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
