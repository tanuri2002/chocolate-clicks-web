export default function Navbar() {
  return (
    <nav className="h-15 flex-shrink-0 border-b border-gray-800 flex items-center justify-between px-6 md:px-10" style={{ fontFamily: 'Kalnia', backgroundColor: '#2a1810', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, width: '100%' }}>
      <div className="text-2xl font-semibold text-white">Home</div>
      <div className="flex gap-6 md:gap-8 text-white text-sm md:text-base">
        <a href="/" className="hover:text-orange-900 transition">Home</a>
        <a href="/login" className="hover:text-orange-900 transition">Log in</a>
        <a href="/signup" className="hover:text-orange-900 transition">Sign up</a>
        <a href="/events" className="hover:text-orange-900 transition">Events</a>
      </div>
    </nav>
  );
}
