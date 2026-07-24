import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        const chats = await Chat.find({ user: session.user.id }).sort({ updatedAt: 'desc' });

        return NextResponse.json(chats, { status: 200 });

    } catch (error) {
        console.error("Error fetching chats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newChat = await Chat.create({ user: user._id });

        return NextResponse.json(newChat, { status: 201 });

    } catch (error) {
        console.error("Error creating chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
