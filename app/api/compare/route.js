import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file1 = formData.get("file1");
    const file2 = formData.get("file2");
    const ignoreFile = formData.get("ignoreFile");

    if (!file1 || !file2 || !ignoreFile) {
      return NextResponse.json({ error: "Missing files" }, { status: 400 });
    }

    // Read file contents
    const buffer1 = Buffer.from(await file1.arrayBuffer());
    const buffer2 = Buffer.from(await file2.arrayBuffer());
    const ignoreText = await ignoreFile.text();

    const ignoreList = ignoreText
      .split("\n")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);

    const readExcelFromBuffer = (buffer) => {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array
    };

    const summarize = (data) => {
      const map = {};
      data.forEach((row) => {
        const name = row[0]?.toString().trim().toLowerCase();
        const qty = parseInt(row[1], 10);
        if (!name || isNaN(qty) || ignoreList.includes(name)) return;
        map[name] = (map[name] || 0) + qty;
      });
      return map;
    };

    const q1 = summarize(readExcelFromBuffer(buffer1));
    const q2 = summarize(readExcelFromBuffer(buffer2));

    // Build HTML table
let html = `
<table class="min-w-full border border-gray-300 divide-y divide-gray-200">
  <thead class="bg-blue-500 text-white">
    <tr>
      <th class="px-4 py-2 text-left">Item</th>
      <th class="px-4 py-2 text-left">File1</th>
      <th class="px-4 py-2 text-left">File2</th>
      <th class="px-4 py-2 text-left">Diff</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-200">
`;

Object.keys(q1).forEach((key) => {
  const diff = q1[key] - (q2[key] || 0);
  if (diff !== 0) {
    html += `
    <tr class="hover:bg-gray-100">
      <td class="px-4 py-2">${key}</td>
      <td class="px-4 py-2">${q1[key]}</td>
      <td class="px-4 py-2">${q2[key] || 0}</td>
      <td class="px-4 py-2">${diff}</td>
    </tr>`;
  }
});

Object.keys(q2).forEach((key) => {
  if (!q1[key]) {
    const diff = -q2[key];
    if (diff !== 0) {
      html += `
      <tr class="hover:bg-gray-100">
        <td class="px-4 py-2">${key}</td>
        <td class="px-4 py-2">0</td>
        <td class="px-4 py-2">${q2[key]}</td>
        <td class="px-4 py-2">${diff}</td>
      </tr>`;
    }
  }
});

html += "</tbody></table>";


    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
