import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import Chat from "@/models/Chat";

export async function GET(req: NextRequest, context: { params: Promise<{ chatId: string }> }) {
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

        const messages = await Message.find({ chat: params.chatId }).sort({ createdAt: 'asc' });

        return NextResponse.json(messages, { status: 200 });

    } catch (error) {
        console.error("Error fetching messages:", error);
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

        const { messageId } = await req.json();

        await connectToDB();

        const chat = await Chat.findById(params.chatId);

        if (!chat || chat.user.toString() !== session.user.id) {
            return NextResponse.json({ error: "Chat not found or access denied" }, { status: 404 });
        }

        const message = await Message.findById(messageId);

        if (!message || message.chat.toString() !== params.chatId) {
            return NextResponse.json({ error: "Message not found or access denied" }, { status: 404 });
        }

        await Message.findByIdAndDelete(messageId);

        return NextResponse.json({ message: "Message deleted" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
