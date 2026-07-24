import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
	],
	pages: {
		signIn: "/login",
	},
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async signIn({ profile }) {
			try {
				await connectToDB();

if (!profile) {
					return false;
				}
				// check if user already exists
				const userExists = await User.findOne({ email: profile.email });

				// if not, create a new user
				if (!userExists) {
					await User.create({
						email: profile.email,
						name: profile.name,
						image: profile.image,
					});
				}

				return true;
			} catch (error) {
				console.log("Error in signIn callback: ", error);
				return false;
			}
		},
		async session({ session }) {
			await connectToDB();
			if (!session.user?.email) {
				return session;
			}
			const sessionUser = await User.findOne({
				email: session.user.email,
			});
			if (sessionUser) {
				session.user.id = sessionUser._id.toString();
			}
			return session;
		},
	},
};
