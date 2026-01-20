import login1 from '../assets/login1.jpeg'; 

export default function Login() {
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden pt-16">
      {/* Main content – side by side on large screens */}
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Left: Image – hidden on mobile, shown from lg breakpoint */}
        <div className="hidden lg:flex items-center justify-center bg-gray-950">
          <img
            src={login1}
            alt="Tray of gooey S'mores brownies with toasted marshmallows"
            className="w-full max-w-3xl h-auto object-cover rounded-2xl shadow-2xl shadow-black/60"
          />
        </div>

        {/* Right: Form – always visible, centered */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md space-y-10 px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
            <h1 className="text-4xl md:text-5xl font-bold text-center lg:text-left" style={{ fontFamily: 'Kalnia' }}>
              Login
            </h1>

            <form className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-gray-400 mb-2 font-medium"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="
                    w-full px-5 py-4 bg-gray-900 border-2 border-orange-900/60
                    rounded-lg text-white placeholder-gray-600 
                    focus:outline-none focus:border-smores-orange 
                    focus:ring-2 focus:ring-smores-orange/40 transition
                  "
                  placeholder="Email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-400 mb-2 font-medium"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="
                    w-full px-5 py-4 bg-gray-900 border-2 border-orange-900/60
                    rounded-lg text-white placeholder-gray-600 
                    focus:outline-none focus:border-smores-orange 
                    focus:ring-2 focus:ring-smores-orange/40 transition
                  "
                  placeholder="Password"
                />
              </div>

              <button
                type="submit"
                className="
                  w-full py-4 bg-smores-orange text-black font-bold 
                  rounded-xl hover:bg-orange-400 transition duration-200
                  shadow-lg shadow-smores-orange/20
                "
              >
                Login
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm">
              Have and Account?{' '}
              <a href="/signup" className="text-smores-orange hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
