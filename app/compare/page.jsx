"use client";

import { useState } from "react";

export default function ComparePage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const res = await fetch("/api/compare", {
      method: "POST",
      body: formData,
    });

    const html = await res.text();
    document.getElementById("result").innerHTML = html;
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Compare Excel Files
      </h1>

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg space-y-4"
      >
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            File 1
          </label>
          <input
            type="file"
            name="file1"
            accept=".xlsx,.xls"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            File 2
          </label>
          <input
            type="file"
            name="file2"
            accept=".xlsx,.xls"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Ignore File (TXT)
          </label>
          <input
            type="file"
            name="ignoreFile"
            accept=".txt"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-200 disabled:opacity-50"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {/* Result Table */}
      <div className="mt-10 w-full max-w-4xl overflow-x-auto">
        <div
          id="result"
          className="bg-white shadow-md rounded-lg p-4 text-gray-800"
        ></div>
      </div>
    </div>
  );
}
