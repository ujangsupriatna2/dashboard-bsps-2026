import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "upload",
      "Inver IV_Kab. Bandung.xlsx"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // === Sheet 1: Data Calon Penerima ===
    const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
    const rawData: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(sheet1, { header: 1 });

    // Row layout: rows 0-3 are titles, row 4 is header, row 5+ is data
    const headerIdx = 4;
    const headers = rawData[headerIdx] as string[];

    const penerimaList: Record<string, string | number | null>[] = [];
    for (let i = headerIdx + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !row[0] || typeof row[0] !== "number") continue;

      penerimaList.push({
        no: row[0],
        kodeDesa: row[1] || null,
        nama: String(row[2] || ""),
        jenisKelamin: String(row[3] || ""),
        noKtp: String(row[4] || ""),
        noKk: String(row[5] || ""),
        alamat: String(row[6] || ""),
        desa: String(row[7] || ""),
        kecamatan: String(row[8] || ""),
        kabupaten: String(row[9] || ""),
        provinsi: String(row[10] || ""),
        delineasi: String(row[11] || ""),
        pengusul: String(row[12] || ""),
        status: String(row[13] || ""),
        keterangan: String(row[14] || ""),
        pengelompokanDesil: String(row[15] || ""),
        colQ: row[16] || null,
        colR: row[17] || null,
      });
    }

    // === Statistics ===
    const totalPenerima = penerimaList.length;
    const totalL = penerimaList.filter((r) => r.jenisKelamin === "L").length;
    const totalP = penerimaList.filter((r) => r.jenisKelamin === "P").length;

    // By kecamatan
    const kecamatanMap = new Map<
      string,
      { l: number; p: number; total: number; desaSet: Set<string> }
    >();
    for (const r of penerimaList) {
      const kec = r.kecamatan;
      if (!kecamatanMap.has(kec)) {
        kecamatanMap.set(kec, { l: 0, p: 0, total: 0, desaSet: new Set() });
      }
      const entry = kecamatanMap.get(kec)!;
      entry.total++;
      if (r.jenisKelamin === "L") entry.l++;
      if (r.jenisKelamin === "P") entry.p++;
      if (r.desa) entry.desaSet.add(r.desa);
    }

    const kecamatanData = Array.from(kecamatanMap.entries())
      .map(([name, data]) => ({
        name,
        l: data.l,
        p: data.p,
        total: data.total,
        desaCount: data.desaSet.size,
      }))
      .sort((a, b) => b.total - a.total);

    const totalKecamatan = kecamatanData.length;
    const totalDesa = new Set(penerimaList.map((r) => r.desa)).size;

    // By desil (pengelompokan)
    const desilMap = new Map<string, number>();
    for (const r of penerimaList) {
      const d = r.pengelompokanDesil || "-";
      desilMap.set(d, (desilMap.get(d) || 0) + 1);
    }
    const desilData = Array.from(desilMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // By keterangan detail
    const ketMap = new Map<string, number>();
    for (const r of penerimaList) {
      const k = r.keterangan || "-";
      ketMap.set(k, (ketMap.get(k) || 0) + 1);
    }
    const keteranganData = Array.from(ketMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // By desa
    const desaMap = new Map<string, number>();
    for (const r of penerimaList) {
      const d = r.desa;
      desaMap.set(d, (desaMap.get(d) || 0) + 1);
    }
    const desaData = Array.from(desaMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // === Sheet 2: DATA PERDESA ===
    const sheet2 = workbook.Sheets[workbook.SheetNames[1]];
    const rawDesa: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(sheet2, { header: 1 });

    const perdesaData: Record<string, string | number | null>[] = [];
    const perdesaHeaders = rawDesa[0] as string[];
    for (let i = 1; i < rawDesa.length; i++) {
      const row = rawDesa[i];
      if (!row || !row[0] || typeof row[0] !== "number") continue;
      perdesaData.push({
        no: row[0],
        namaDesa: String(row[1] || ""),
        namaKecamatan: String(row[2] || ""),
        jumlahAlokasi: row[3] || 0,
        totalAlokasi: row[4] || null,
        tflTeknik: String(row[5] || "-"),
        tflPemberdayaan: String(row[6] || "-"),
        kontakPIC: String(row[7] || "-"),
        namaPIC: String(row[8] || "-"),
      });
    }

    // === Sheet 3: DATA PERKECAMATAN ===
    const sheet3 = workbook.Sheets[workbook.SheetNames[2]];
    const rawKec: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(sheet3, { header: 1 });

    const perkecamatanData: Record<string, string | number | null>[] = [];
    for (let i = 1; i < rawKec.length; i++) {
      const row = rawKec[i];
      if (!row || !row[0] || typeof row[0] !== "number") continue;
      perkecamatanData.push({
        no: row[0],
        namaDesa: String(row[1] || ""),
        namaKecamatan: String(row[2] || ""),
        jumlahAlokasi: row[3] || 0,
        alokasiPerkecamatan: row[4] || null,
      });
    }

    // Alokasi per kecamatan summary
    const alokasiKecMap = new Map<string, { total: number; desaList: string[] }>();
    for (const r of perkecamatanData) {
      const kec = String(r.namaKecamatan);
      const desa = String(r.namaDesa);
      if (!alokasiKecMap.has(kec)) {
        alokasiKecMap.set(kec, { total: 0, desaList: [] });
      }
      const entry = alokasiKecMap.get(kec)!;
      entry.total += Number(r.jumlahAlokasi) || 0;
      entry.desaList.push(desa);
    }

    const alokasiPerKecamatan = Array.from(alokasiKecMap.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        desaCount: data.desaList.length,
        desaList: data.desaList,
      }))
      .sort((a, b) => b.total - a.total);

    // === TFL Data: Group by TFL assignment ===
    // Forward-fill with reset-on-new-name logic:
    // - Both columns have names on same row → new pair (sejajar)
    // - One column has name, other is "-" → solo TFL, RESET the other column to "-"
    // - Both columns are "-" or empty → forward-fill from last values (continuation)
    let lastTeknik = "";
    let lastPemberdayaan = "";
    for (const r of perdesaData) {
      let teknik = String(r.tflTeknik || "").trim();
      let pemberdayaan = String(r.tflPemberdayaan || "").trim();

      // Treat "-" as empty (no TFL assigned / continuation marker)
      if (teknik === "-") teknik = "";
      if (pemberdayaan === "-") pemberdayaan = "";

      const tHasName = teknik !== "";
      const pHasName = pemberdayaan !== "";

      if (tHasName && pHasName) {
        // Both columns have names → new pair
        lastTeknik = teknik;
        lastPemberdayaan = pemberdayaan;
      } else if (tHasName) {
        // Only Teknik has name → solo TFL, reset Pemberdayaan
        lastTeknik = teknik;
        lastPemberdayaan = "";
      } else if (pHasName) {
        // Only Pemberdayaan has name → solo TFL, reset Teknik
        lastPemberdayaan = pemberdayaan;
        lastTeknik = "";
      }
      // If both are empty → forward-fill from last values (continuation row)

      (r as Record<string, unknown>).tflTeknik = lastTeknik || "-";
      (r as Record<string, unknown>).tflPemberdayaan = lastPemberdayaan || "-";
    }

    // Build perdesa lookup after forward-fill: desa+kecamatan -> { tflTeknik, tflPemberdayaan }
    const perdesaLookup = new Map<string, { tflTeknik: string; tflPemberdayaan: string }>();
    for (const r of perdesaData) {
      const key = String(r.namaDesa).trim() + "|" + String(r.namaKecamatan).trim();
      perdesaLookup.set(key, {
        tflTeknik: String((r as Record<string, unknown>).tflTeknik || "-").trim(),
        tflPemberdayaan: String((r as Record<string, unknown>).tflPemberdayaan || "-").trim(),
      });
    }

    // Group penerima by TFL pair key: "teknik|pemberdayaan"
    interface TFLMember {
      nama: string;
      noKtp: string;
      noKk: string;
      alamat: string;
      desa: string;
      kecamatan: string;
    }

    interface TFLPairGroup {
      tflTeknik: string;
      tflPemberdayaan: string;
      desaList: string[];
      penerimaCount: number;
      members: TFLMember[];
    }

    const tflPairMap = new Map<string, { tflTeknik: string; tflPemberdayaan: string; desaSet: Set<string>; members: TFLMember[] }>();

    for (const r of penerimaList) {
      const desa = String(r.desa).trim();
      const kec = String(r.kecamatan).trim();
      const tflInfo = perdesaLookup.get(desa + "|" + kec);
      const teknik = tflInfo?.tflTeknik || "-";
      const pemberdayaan = tflInfo?.tflPemberdayaan || "-";
      const pairKey = teknik + "|" + pemberdayaan;

      if (!tflPairMap.has(pairKey)) {
        tflPairMap.set(pairKey, { tflTeknik: teknik, tflPemberdayaan: pemberdayaan, desaSet: new Set(), members: [] });
      }
      const entry = tflPairMap.get(pairKey)!;
      entry.desaSet.add(desa);
      entry.members.push({
        nama: String(r.nama),
        noKtp: String(r.noKtp || ""),
        noKk: String(r.noKk || ""),
        alamat: String(r.alamat),
        desa,
        kecamatan: kec,
      });
    }

    // Build TFLPairGroup array
    const tflPairData: TFLPairGroup[] = Array.from(tflPairMap.values()).map((g) => ({
      tflTeknik: g.tflTeknik,
      tflPemberdayaan: g.tflPemberdayaan,
      desaList: Array.from(g.desaSet).sort(),
      penerimaCount: g.members.length,
      members: g.members,
    }));

    // Sort: pairs with both TFL first, then by penerimaCount desc
    tflPairData.sort((a, b) => {
      const aFull = (a.tflTeknik !== "-" && a.tflPemberdayaan !== "-") ? 0 : 1;
      const bFull = (b.tflTeknik !== "-" && b.tflPemberdayaan !== "-") ? 0 : 1;
      if (aFull !== bFull) return aFull - bFull;
      return b.penerimaCount - a.penerimaCount;
    });

    return NextResponse.json({
      summary: {
        totalPenerima,
        totalL,
        totalP,
        totalKecamatan,
        totalDesa,
      },
      penerimaList,
      kecamatanData,
      desilData,
      keteranganData,
      desaData,
      perdesaData,
      perkecamatanData,
      alokasiPerKecamatan,
      tflPairData,
    });
  } catch (error) {
    console.error("Error reading Excel:", error);
    return NextResponse.json(
      { error: "Gagal membaca file Excel", detail: String(error) },
      { status: 500 }
    );
  }
}
