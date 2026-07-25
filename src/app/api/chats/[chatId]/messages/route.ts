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

export async function PATCH(req: NextRequest, context: { params: Promise<{ chatId: string }> }) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messageId, content } = await req.json();

        if (!messageId || typeof content !== "string" || !content.trim()) {
            return NextResponse.json(
                { error: "messageId and content are required" },
                { status: 400 },
            );
        }

        await connectToDB();

        const chat = await Chat.findById(params.chatId);

        if (!chat || chat.user.toString() !== session.user.id) {
            return NextResponse.json({ error: "Chat not found or access denied" }, { status: 404 });
        }

        const messages = await Message.find({ chat: params.chatId }).sort({ createdAt: "asc" });
        const messageIndex = messages.findIndex((message) => message._id.toString() === messageId);

        if (messageIndex === -1) {
            return NextResponse.json({ error: "Message not found or access denied" }, { status: 404 });
        }

        const targetMessage = messages[messageIndex];

        if (targetMessage.role !== "user") {
            return NextResponse.json(
                { error: "Only user messages can be edited" },
                { status: 400 },
            );
        }

        const laterMessageIds = messages
            .slice(messageIndex + 1)
            .map((message) => message._id);

        if (!targetMessage.originalContent) {
            targetMessage.originalContent = targetMessage.content;
        }
        targetMessage.content = content.trim();
        targetMessage.isEdited = true;
        targetMessage.editedAt = new Date();
        await targetMessage.save();

        if (laterMessageIds.length > 0) {
            await Message.deleteMany({ _id: { $in: laterMessageIds } });
        }

        const updatedMessages = await Message.find({ chat: params.chatId }).sort({
            createdAt: "asc",
        });

        return NextResponse.json(updatedMessages, { status: 200 });
    } catch (error) {
        console.error("Error updating message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
