'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

type Item = {
  name: string;
  price: number;
  maxQty: number;
};

const items: Item[] = [
  { name: 'Spicy Ramen With Kaarage', price: 79000, maxQty: 1 },
  { name: 'Ocha', price: 18000, maxQty: 3 },
  { name: 'Beef Katsu Set', price: 99000, maxQty: 1 },
  { name: 'Age Takoyaki', price: 49000, maxQty: 1 },
  { name: 'Dragon Roll', price: 55000, maxQty: 1 },
  { name: 'Triple Salmon Nishi Style Sushi', price: 35000, maxQty: 2 },
  { name: 'Nishi Signature Ramen', price: 60000, maxQty: 2 },
  { name: 'Spicy Salmon Gunkan', price: 25000, maxQty: 1 },
  { name: 'Tuna Mayo Salad Gunkan', price: 20000, maxQty: 1 },
  { name: 'Aburi Salmon Mentai Sushi', price: 25000, maxQty: 1 },
  { name: 'Pokka Green Tea', price: 30000, maxQty: 1 },
  { name: 'Virgin Mojito', price: 45000, maxQty: 1 },
  { name: 'Cheesy Salmon Roll', price: 60000, maxQty: 1 },
  { name: 'Tori Karaage', price: 35000, maxQty: 2 },
];

export default function POSPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (name: string, delta: number, max: number) => {
    setQuantities((prev) => {
      const newQty = Math.min(Math.max((prev[name] || 0) + delta, 0), max);
      return { ...prev, [name]: newQty };
    });
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (quantities[item.name] || 0) * item.price,
    0
  );
  const serviceCharge = subtotal * 0.075;
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + serviceCharge + tax;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {!confirmed ? (
        <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow">
          <h1 className="text-3xl font-bold mb-4 text-center text-black">NISHI IZAKAYA</h1>
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-medium text-black">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Rp {item.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 bg-teal-500 rounded-full hover:bg-teal-600"
                      onClick={() => handleChange(item.name, -1, item.maxQty)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center text-black">
                      {quantities[item.name] || 0}
                    </span>
                    <button
                      className="p-2 bg-teal-500 rounded-full hover:bg-teal-600"
                      onClick={() => handleChange(item.name, 1, item.maxQty)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-xs text-red-500 whitespace-nowrap">Max: {item.maxQty}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-4 space-y-1 text-right text-black">
            <p>
              Subtotal: <span className="text-xl">Rp {subtotal.toLocaleString()}</span>
            </p>
            <p>
              Service (7.5%): <span className="text-xl">Rp {serviceCharge.toLocaleString()}</span>
            </p>
            <p>
              Tax (10%): <span className="text-xl">Rp {tax.toLocaleString()}</span>
            </p>
            <hr className="my-2" />
            <p className="text-xl font-bold">
              Grand Total: Rp {grandTotal.toLocaleString()}
            </p>
          </div>

          <button
            className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
            onClick={() => setConfirmed(true)}
          >
            Confirm
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-3xl font-bold mb-6 text-black">
            Rp {grandTotal.toLocaleString()}
          </h2>
          <div className="flex justify-center mb-4">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg"
              alt="BCA Logo"
              width={180}
              height={80}
            />
          </div>
          <p className="text-lg font-medium text-black">a/n Stephen Hadisurja</p>
          <p className="text-xl font-bold tracking-wide text-black">5270695258</p>

          <button
            className="mt-6 text-sm text-blue-600 underline"
            onClick={() => setConfirmed(false)}
          >
            Back to Menu
          </button>
        </div>
      )}
    </main>
  );
}
