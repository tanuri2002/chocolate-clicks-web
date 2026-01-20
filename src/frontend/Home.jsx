import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Horizontal NavBar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>
          MyWebsite
        </h1>
        <div>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">
        <h2 className="text-3xl font-bold mb-4">Welcome to the Home Page!</h2>
        <p className="text-gray-700 mb-2">
          This is a dummy home page. You can add your features like "Add a trip", "View memories", etc.
        </p>
        <p className="text-gray-700">Click the Login button above to go to the login page.</p>
      </main>
    </div>
  );
}
