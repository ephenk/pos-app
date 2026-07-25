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
  { name: 'Jeruk Murni (Iced)', price: 42000, maxQty: 2 },
  { name: 'Teh Jawa (Iced)', price: 23000, maxQty: 1 },
  { name: 'Wedang Angsle', price: 43000, maxQty: 1 },
  { name: 'Risol Bihun', price: 33000, maxQty: 1 },
  { name: 'Sate Ayam Ponorogo Daging', price: 89000, maxQty: 8 },
  { name: 'Nasi Putih', price: 19000, maxQty: 8 },
  { name: 'Tahu Kipas Udang (4 Pcs)', price: 82000, maxQty: 1 },
  { name: 'Teh Jawa (Hot)', price: 23000, maxQty: 5 },
  { name: 'Lime Tea (Hot)', price: 35000, maxQty: 1 },
  { name: 'Lime Tea (Iced)', price: 35000, maxQty: 1 },
  { name: 'Nasi Bebek Goreng', price: 95000, maxQty: 1 },
  { name: 'Teh Poci', price: 45000, maxQty: 1 },
];

const roundToTen = (amount: number) => Math.round(amount / 10) * 10;

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
  const gratuity = roundToTen(subtotal * (1 / 22));
  const tax = roundToTen((subtotal + gratuity) * 0.1);
  const grandTotal = subtotal + gratuity + tax;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {!confirmed ? (
        <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow">
          <h1 className="text-3xl font-bold mb-4 text-center text-black">SATE KHAS SENAYAN MKG</h1>
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
              Gratuity: <span className="text-xl">Rp {gratuity.toLocaleString()}</span>
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
