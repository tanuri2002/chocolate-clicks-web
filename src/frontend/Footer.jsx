export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'Kalnia' }}>
              Chocolate Clicks
            </h3>
            <p className="text-sm leading-relaxed">
              Crafting premium chocolate treats for every celebration. From cakes to brownies, each creation is made with love and the finest ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'Kalnia' }}>
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-orange-500 transition">Home</a>
              </li>
              <li>
                <a href="/events" className="hover:text-orange-500 transition">Events</a>
              </li>
              <li>
                <a href="/login" className="hover:text-orange-500 transition">Login</a>
              </li>
              <li>
                <a href="/signup" className="hover:text-orange-500 transition">Sign Up</a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'Kalnia' }}>
              Contact Us
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Email: info@chocolateclicks.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Chocolate Lane, Sweet City, SC 12345</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; 2024 Chocolate Clicks. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0 text-sm">
              <a href="#" className="hover:text-orange-500 transition">Privacy Policy</a>
              <a href="#" className="hover:text-orange-500 transition">Terms of Service</a>
              <a href="#" className="hover:text-orange-500 transition">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
