import Button from '@mui/material/Button';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full mr-2" />
            <h1 className="text-xl font-bold">AI Chat</h1>
        </div>
        <nav>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <h2 className="text-5xl font-bold mb-4">Your personal AI Chat Assistant</h2>
          <p className="text-xl text-gray-500 mb-8">
            Built with Next.js, Gemini, and MongoDB.
          </p>
          <Link href="/login">
            <Button size="large" variant="contained">Start Chatting Now</Button>
          </Link>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold mb-12">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8">Feature 1</div>
                <div className="p-8">Feature 2</div>
                <div className="p-8">Feature 3</div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold mb-12">How It Works</h3>
            {/* ... */}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold mb-12">FAQ</h3>
            {/* ... */}
          </div>
        </section>
      </main>

      <footer className="p-4 text-center border-t">
        <p>&copy; 2024 AI Chat Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
}
