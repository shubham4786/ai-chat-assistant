import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Chat from "@/models/Chat";
import { connectToDB } from "@/lib/mongodb";

async function getChats(userId: string) {
    await connectToDB();
    const chats = await Chat.find({ user: userId }).sort({ updatedAt: 'desc' });
    return chats;
}

export default async function ChatRootPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        redirect('/login');
    }

    const chats = await getChats(session.user.id);

    if (chats.length > 0) {
        redirect(`/chat/${chats[0]._id}`);
    }

    return (
        <div className="flex flex-col h-full items-center justify-center">
            <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-500 mb-4"></div>
                <h1 className="text-2xl font-semibold">Welcome to AI Chat</h1>
                <p className="text-gray-500">Create a new chat to get started.</p>
            </div>
        </div>
    );
}
