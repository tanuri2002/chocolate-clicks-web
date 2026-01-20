import login from '../assets/login.jpeg';

export default function FoodItems() {
  const cakes = [
    { id: 1, name: 'Luxury Chocolate Cake', image: login },
    { id: 2, name: 'Berry Bliss Cake', image: login },
    { id: 3, name: 'Custom Wedding Cake', image: login },
  ];

  const cupcakes = [
    { id: 4, name: 'Classic Vanilla Cupcake', image: login },
    { id: 5, name: 'Chocolate Delight Cupcake', image: login },
    { id: 6, name: 'Red Velvet Cupcake', image: login },
  ];

  const brownies = [
    { id: 7, name: 'Fudgy Brownie', image: login },
    { id: 8, name: "S'mores Brownie", image: login },
    { id: 9, name: 'Espresso Brownie', image: login },
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="h-screen flex items-center justify-center text-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${login}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-2xl px-6 z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Kalnia' }}>
            Sweeten Your Day with Chocolate Clicks!
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Explore our freshly baked delights — from cakes to brownies, each made with love and premium chocolate.
          </p>
          <a
            href="#products"
            className="inline-block bg-white hover:bg-orange-900 text-amber-950 font-bold py-3 px-8 rounded-full transition duration-300"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-6">
        {/* Cakes */}
        <div className="max-w-6xl mx-auto mb-40 pb-20" style={{ borderBottom: '2px solid rgba(42, 24, 16, 0.8)' }}>
          <h2 className="text-3xl font-bold text-left text-white mb-12" style={{ fontFamily: 'Kalnia' }}>
            Cakes...
          </h2>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl">
            Celebrate every occasion with our beautifully crafted cakes — from birthdays to weddings, made in your favorite flavors and designs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cakes.map((cake) => (
              <div
                key={cake.id}
                className="bg-amber-950 rounded-lg overflow-hidden hover:transform hover:translate-y-[-10px] transition duration-300 cursor-pointer"
              >
                <img src={cake.image} alt={cake.name} className="w-full h-64 object-cover" />
                <h3 className="text-l p-4 text-center" style={{ fontFamily: 'Kalnia' }}>{cake.name}</h3>
              </div>
            ))}
          </div>
          <button className="block mx-auto mt-8 bg-orange-900 hover:bg-orange-800 text-white font-bold py-3 px-6 rounded-full transition">
            See More Cakes →
          </button>
        </div>

        {/* Cupcakes */}
        <div className="max-w-6xl mx-auto mb-40 pb-20" style={{ borderBottom: '2px solid rgba(42, 24, 16, 0.8)' }}>
          <h2 className="text-3xl font-bold text-left text-white mb-12" style={{ fontFamily: 'Kalnia' }}>
            Cupcakes...
          </h2>
          <p className="text-gray-300 text-lg mb-12 max-w-2xl">
            Celebrate every occasion with our beautifully crafted cakes — from birthdays to weddings, made in your favorite flavors and designs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cupcakes.map((cupcake) => (
              <div
                key={cupcake.id}
                className="bg-amber-950 rounded-lg overflow-hidden hover:transform hover:translate-y-[-10px] transition duration-300 cursor-pointer"
              >
                <img src={cupcake.image} alt={cupcake.name} className="w-full h-64 object-cover" />
                <h3 className="text-l p-4 text-center" style={{ fontFamily: 'Kalnia' }}>{cupcake.name}</h3>
              </div>
            ))}
          </div>
          <button className="block mx-auto mt-8 bg-orange-900 hover:bg-orange-800 text-white font-bold py-3 px-6 rounded-full transition">
            See More Cupcakes →
          </button>
        </div>

        {/* Brownies */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-left text-white mb-12" style={{ fontFamily: 'Kalnia' }}>
            Brownies...
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brownies.map((brownie) => (
              <div
                key={brownie.id}
                className="bg-amber-950 rounded-lg overflow-hidden hover:transform hover:translate-y-[-10px] transition duration-300 cursor-pointer"
              >
                <img src={brownie.image} alt={brownie.name} className="w-full h-64 object-cover" />
                <h3 className="text-l p-4 text-center" style={{ fontFamily: 'Kalnia' }}>{brownie.name}</h3>
              </div>
            ))}
          </div>
          <button className="block mx-auto mt-8 bg-orange-900 hover:bg-orange-800 text-white font-bold py-3 px-6 rounded-full transition">
            See More Brownies →
          </button>
        </div>
      </section>
    </div>
  );
}
