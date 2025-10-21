import Image from "next/image";
import Link from "next/link"; // Import Link component

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4">
      <main className="flex flex-col items-center justify-center text-center gap-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4">
          Chào mừng bạn tới Game Show
          <span className="block text-yellow-300">Của đội Luminous AI</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Nơi kiến thức được thử thách và vinh quang đang chờ đón!
        </p>
        <Link href="/login">
          <button className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300">
            Bắt đầu khám phá
          </button>
        </Link>
      </main>
    </div>
  );
}
