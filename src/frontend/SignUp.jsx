import signup from '../assets/signup.jpeg'; 

export default function SignUp() {
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden pt-16">
      {/* Main content – side by side on large screens */}
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Left: Image – hidden on mobile, shown from lg breakpoint */}
        <div className="hidden lg:flex items-center justify-center bg-gray-950">
          <img
            src={signup}
            alt="Tray of gooey S'mores brownies with toasted marshmallows"
            className="w-full max-w-3xl h-auto object-cover shadow-2xl shadow-black/60"
          />
        </div>

        {/* Right: Form – always visible, centered */}
        <div className="flex flex-col items-center justify-start pt-70 lg:pt-30 pb-6">
          <div className="w-full max-w-md space-y-9 px-6 py-10 sm:px-12 lg:px-16 xl:px-0">
            <h1 className="text-3xl md:text-4xl text-center lg:text-left" style={{ fontFamily: 'Kalnia' }}>
              Welcome to Chocolate Clicks!
            </h1>

            <form className="space-y-8" style={{ fontFamily: 'Kalnia' }}>
              <div>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="
                    w-full px-5 py-4 bg-orange-950 border-2 border-orange-900/60
                    rounded-lg text-white placeholder-white/60 
                    focus:outline-none focus:border-smores-orange 
                    focus:ring-2 focus:ring-smores-orange/40 transition
                  "
                  placeholder="First Name"
                />
              </div>

              <div>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="
                    w-full px-5 py-4 bg-orange-950 border-2 border-orange-900/60
                    rounded-lg text-white placeholder-white/60 
                    focus:outline-none focus:border-smores-orange 
                    focus:ring-2 focus:ring-smores-orange/40 transition
                  "
                  placeholder="Last Name"
                />
              </div>

              <div>
                <input
                  id="contactNumber"
                  type="tel"
                  required
                  className="
                    w-full px-5 py-4 bg-orange-950 border-2 border-orange-900/60
                    rounded-lg text-white placeholder-white/60 
                    focus:outline-none focus:border-smores-orange 
                    focus:ring-2 focus:ring-smores-orange/40 transition
                  "
                  placeholder="Contact Number"
                />
              </div>

              <div>
                <input
                  id="email"
                  type="email"
                  required
                  className="
                    w-full px-5 py-4 bg-orange-950 border-2 border-orange-900/60
                    rounded-lg text-white placeholder-white/60 
                    focus:outline-none focus:border-smores-orange 
                    focus:ring-2 focus:ring-smores-orange/40 transition
                  "
                  placeholder="Email"
                />
              </div>

              <div>
                <input
                  id="password"
                  type="password"
                  required
                  className="
                    w-full px-5 py-4 bg-orange-950 border-2 border-orange-900/60
                    rounded-lg text-white placeholder-white/60 
                    focus:outline-none focus:border-smores-orange 
                    focus:ring-2 focus:ring-smores-orange/40 transition
                  "
                  placeholder="Password"
                />
              </div>

              <button
                type="submit"
                className="
                  w-full py-4 bg-white text-gray-950  
                  rounded-xl hover:bg-orange-400 transition duration-200
                  shadow-lg shadow-smores-orange/20
                "
              >
                Sign Up
              </button>
            </form>

            <p className="text-center text-orange-500 text-sm" style={{ fontFamily: 'Kalnia' }}>
              Have an Account?{' '}
              <a href="/login" className="text-smores-orange hover:underline font-medium text-blue-800">
                Log In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
