"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  MapPin,
  Building2,
  User,
  UserRound,
  Search,
  FileSpreadsheet,
  BarChart3,
  Home,
  ListFilter,
  Wrench,
  HandHelping,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ============== Types ==============
interface Summary {
  totalPenerima: number;
  totalL: number;
  totalP: number;
  totalKecamatan: number;
  totalDesa: number;
}

interface Penerima {
  no: number;
  kodeDesa: number | null;
  nama: string;
  jenisKelamin: string;
  noKtp: string;
  noKk: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  delineasi: string;
  pengusul: string;
  status: string;
  keterangan: string;
  pengelompokanDesil: string;
}

interface KecamatanStat {
  name: string;
  l: number;
  p: number;
  total: number;
  desaCount: number;
}

interface DesilStat {
  name: string;
  value: number;
}

interface DesaStat {
  name: string;
  value: number;
}

interface PerdesaRow {
  no: number;
  namaDesa: string;
  namaKecamatan: string;
  jumlahAlokasi: number;
  totalAlokasi: number | null;
  tflTeknik: string;
  tflPemberdayaan: string;
  kontakPIC: string;
  namaPIC: string;
}

interface AlokasiKecamatan {
  name: string;
  total: number;
  desaCount: number;
  desaList: string[];
}

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

interface DashboardData {
  summary: Summary;
  penerimaList: Penerima[];
  kecamatanData: KecamatanStat[];
  desilData: DesilStat[];
  keteranganData: DesilStat[];
  desaData: DesaStat[];
  perdesaData: PerdesaRow[];
  perkecamatanData: PerdesaRow[];
  alokasiPerKecamatan: AlokasiKecamatan[];
  tflPairData: TFLPairGroup[];
}

// ============== Chart Colors ==============
const COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(47, 96%, 53%)",
  "hsl(25, 95%, 53%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 67%, 53%)",
  "hsl(199, 89%, 48%)",
  "hsl(173, 58%, 39%)",
  "hsl(326, 100%, 74%)",
  "hsl(43, 96%, 56%)",
  "hsl(210, 40%, 50%)",
  "hsl(260, 60%, 55%)",
  "hsl(120, 50%, 45%)",
  "hsl(350, 80%, 55%)",
  "hsl(30, 80%, 50%)",
  "hsl(190, 70%, 45%)",
  "hsl(60, 70%, 50%)",
  "hsl(300, 50%, 50%)",
  "hsl(150, 60%, 40%)",
  "hsl(10, 75%, 55%)",
  "hsl(220, 65%, 55%)",
  "hsl(80, 60%, 45%)",
  "hsl(270, 55%, 55%)",
  "hsl(340, 70%, 55%)",
  "hsl(50, 85%, 50%)",
  "hsl(170, 65%, 42%)",
  "hsl(290, 45%, 50%)",
];

// ============== Components ==============

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
          <div
            className={`rounded-xl p-3 ${color}`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GenderPieChart({ l, p }: { l: number; p: number }) {
  const data = [
    { name: "Laki-laki", value: l, fill: "hsl(210, 70%, 50%)" },
    { name: "Perempuan", value: p, fill: "hsl(340, 70%, 55%)" },
  ];
  const chartConfig = {
    value: { label: "Jumlah" },
    "Laki-laki": { label: "Laki-laki", color: "hsl(210, 70%, 50%)" },
    Perempuan: { label: "Perempuan", color: "hsl(340, 70%, 55%)" },
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Distribusi Jenis Kelamin</CardTitle>
        <CardDescription>Laki-laki vs Perempuan</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function DesilPieChart({ data }: { data: DesilStat[] }) {
  const filtered = data.filter((d) => d.name !== "-");
  const chartConfig: Record<string, { label: string; color: string }> = {
    value: { label: "Jumlah" },
  };
  filtered.forEach((d, i) => {
    chartConfig[d.name] = { label: d.name, color: COLORS[i % COLORS.length] };
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pengelompokan Desil</CardTitle>
        <CardDescription>Kategori backlog perumahan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie
              data={filtered}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name.length > 15 ? name.slice(0, 12) + "..." : name} (${(percent * 100).toFixed(1)}%)`
              }
              labelLine={false}
            >
              {filtered.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function KecamatanBarChart({ data }: { data: KecamatanStat[] }) {
  const chartConfig = {
    laki: { label: "Laki-laki", color: "hsl(210, 70%, 50%)" },
    perempuan: { label: "Perempuan", color: "hsl(340, 70%, 55%)" },
  };

  const chartData = data.map((d) => ({
    name: d.name.length > 8 ? d.name.slice(0, 7) + "." : d.name,
    fullName: d.name,
    laki: d.l,
    perempuan: d.p,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Jumlah Penerima per Kecamatan</CardTitle>
        <CardDescription>Stacked Laki-laki & Perempuan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <YAxis
              dataKey="fullName"
              type="category"
              width={110}
              tick={{ fontSize: 10 }}
              interval={0}
            />
            <XAxis type="number" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => label}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="laki"
              stackId="a"
              fill="hsl(210, 70%, 50%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="perempuan"
              stackId="a"
              fill="hsl(340, 70%, 55%)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function DesaBarChart({ data }: { data: DesaStat[] }) {
  const topDesa = data.slice(0, 15);
  const chartConfig = {
    value: { label: "Jumlah Penerima", color: "hsl(142, 71%, 45%)" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top 15 Desa Penerima Terbanyak</CardTitle>
        <CardDescription>Berdasarkan jumlah calon penerima</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={topDesa} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <XAxis type="number" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AlokasiKecamatanChart({ data }: { data: AlokasiKecamatan[] }) {
  const chartConfig = {
    total: { label: "Total Alokasi", color: "hsl(47, 96%, 53%)" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Alokasi per Kecamatan</CardTitle>
        <CardDescription>Jumlah alokasi berdasarkan kecamatan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <XAxis type="number" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="total" fill="hsl(47, 96%, 53%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[380px] rounded-xl" />
        <Skeleton className="h-[380px] rounded-xl" />
      </div>
      <Skeleton className="h-[500px] rounded-xl" />
    </div>
  );
}

// ============== Login Page ==============
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("bsps_auth", "1");
        onLogin();
      } else {
        setError(data.message || "Code salah");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100/50">
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm shadow-xl border-0">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
              <Home className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl tracking-tight">BSPS 2026 - Tahap IV</CardTitle>
            <CardDescription className="text-sm">
              Kab. Bandung · Provinsi Jawa Barat
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Masukkan Code Akses
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Code..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive text-center font-medium">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memverifikasi...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Direktorat Jenderal Perumahan Perdesaan
            </p>
          </CardContent>
        </Card>
      </main>
      <footer className="border-t bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
          <p className="mt-0.5 font-medium text-foreground/70">By Ujang Supriatna</p>
        </div>
      </footer>
    </div>
  );
}

// ============== Main Page ==============
export default function DashboardPage() {
  const [authState, setAuthState] = useState<"loading" | "guest" | "auth">("loading");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("all");
  const [filterDesil, setFilterDesil] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Check localStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthState(localStorage.getItem("bsps_auth") === "1" ? "auth" : "guest");
  }, []);

  const handleLogin = () => {
    setAuthState("auth");
  };

  const handleLogout = () => {
    localStorage.removeItem("bsps_auth");
    setAuthState("guest");
    setData(null);
    setLoading(true);
    setSearch("");
    setFilterKecamatan("all");
    setFilterDesil("all");
    setFilterGender("all");
    setCurrentPage(1);
  };

  // Fetch dashboard data only when authenticated
  useEffect(() => {
    if (authState !== "auth") return;
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [authState]);

  const filteredPenerima = useMemo(() => {
    if (!data) return [];
    let result = data.penerimaList;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.nama.toLowerCase().includes(s) ||
          r.desa.toLowerCase().includes(s) ||
          r.kecamatan.toLowerCase().includes(s) ||
          r.alamat.toLowerCase().includes(s) ||
          r.noKtp.includes(s) ||
          r.noKk.includes(s)
      );
    }

    if (filterKecamatan !== "all") {
      result = result.filter((r) => r.kecamatan === filterKecamatan);
    }

    if (filterDesil !== "all") {
      result = result.filter((r) => r.pengelompokanDesil === filterDesil);
    }

    if (filterGender !== "all") {
      result = result.filter((r) => r.jenisKelamin === filterGender);
    }

    return result;
  }, [data, search, filterKecamatan, filterDesil, filterGender]);

  const totalPages = Math.ceil(filteredPenerima.length / pageSize);
  const clampedPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedData = filteredPenerima.slice(
    (clampedPage - 1) * pageSize,
    clampedPage * pageSize
  );

  const desilOptions = useMemo(() => {
    if (!data) return [];
    return data.desilData.map((d) => d.name).filter((n) => n !== "-");
  }, [data]);

  const kecamatanOptions = useMemo(() => {
    if (!data) return [];
    return data.kecamatanData.map((d) => d.name);
  }, [data]);

  if (authState === "loading") return <LoadingSkeleton />;
  if (authState === "guest") return <LoginPage onLogin={handleLogin} />;

  if (loading) return <LoadingSkeleton />;
  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Gagal Memuat Data</h2>
          <p className="text-muted-foreground">File Excel tidak ditemukan atau rusak.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                🏠 Dashboard BSPS 2026 - Tahap IV
              </h1>
              <p className="text-sm text-muted-foreground">
                Kab. Bandung · Provinsi Jawa Barat · Direktorat Jenderal Perumahan Perdesaan
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <Badge variant="outline" className="text-xs">
                {data.summary.totalPenerima} Calon Penerima
              </Badge>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md border text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
          <StatCard
            icon={Users}
            label="Total Penerima"
            value={data.summary.totalPenerima}
            sub="calon penerima bantuan"
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={MapPin}
            label="Kecamatan"
            value={data.summary.totalKecamatan}
            sub="kecamatan terdampak"
            color="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <StatCard
            icon={Building2}
            label="Desa / Kelurahan"
            value={data.summary.totalDesa}
            sub=""
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          <StatCard
            icon={User}
            label="Laki-laki"
            value={data.summary.totalL}
            sub={`${((data.summary.totalL / data.summary.totalPenerima) * 100).toFixed(1)}%`}
            color="bg-gradient-to-br from-sky-500 to-sky-600"
          />
          <StatCard
            icon={UserRound}
            label="Perempuan"
            value={data.summary.totalP}
            sub={`${((data.summary.totalP / data.summary.totalPenerima) * 100).toFixed(1)}%`}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="visualisasi" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="visualisasi" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visualisasi</span>
            </TabsTrigger>
            <TabsTrigger value="data-penerima" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Data Penerima</span>
            </TabsTrigger>
            <TabsTrigger value="data-desa" className="gap-1.5 text-xs sm:text-sm">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Data Desa</span>
            </TabsTrigger>
            <TabsTrigger value="data-kecamatan" className="gap-1.5 text-xs sm:text-sm">
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Per Kecamatan</span>
            </TabsTrigger>
            <TabsTrigger value="data-tfl" className="gap-1.5 text-xs sm:text-sm">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Data TFL</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Visualisasi */}
          <TabsContent value="visualisasi" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <GenderPieChart l={data.summary.totalL} p={data.summary.totalP} />
              <DesilPieChart data={data.desilData} />
            </div>
            <KecamatanBarChart data={data.kecamatanData} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DesaBarChart data={data.desaData} />
              <AlokasiKecamatanChart data={data.alokasiPerKecamatan} />
            </div>
          </TabsContent>

          {/* Tab 2: Data Penerima */}
          <TabsContent value="data-penerima" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Daftar Calon Penerima Bantuan</CardTitle>
                <CardDescription>
                  Menampilkan {filteredPenerima.length} dari {data.penerimaList.length} data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama, desa, alamat, KTP..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterKecamatan} onValueChange={setFilterKecamatan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kecamatan</SelectItem>
                      {kecamatanOptions.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDesil} onValueChange={setFilterDesil}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pengelompokan Desil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Desil</SelectItem>
                      {desilOptions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterGender} onValueChange={setFilterGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Hidden columns info */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  <span className="font-semibold">ℹ️ Info:</span> Di file Excel asli, kolom <strong>Kabupaten, Pengusul, Status, Keterangan, dan Pengelompokan Desil</strong> disembunyikan (hidden). Dashboard ini menampilkan <strong>semua data termasuk kolom tersembunyi</strong>.
                </div>

                {/* Table */}
                <div className="rounded-lg border overflow-x-auto">
                    <Table className="text-[11px] sm:text-xs md:text-sm">
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-10 text-center px-1 sm:px-2 sm:w-12">No</TableHead>
                          <TableHead className="px-1 sm:px-2 min-w-[80px] sm:min-w-[120px]">Nama</TableHead>
                          <TableHead className="w-10 text-center px-1">L/P</TableHead>
                          <TableHead className="px-1 sm:px-2 font-mono min-w-[100px] sm:min-w-[155px]">NIK</TableHead>
                          <TableHead className="px-1 sm:px-2 font-mono min-w-[100px] sm:min-w-[155px]">No KK</TableHead>
                          <TableHead className="px-1 sm:px-2 min-w-[90px] sm:min-w-[200px]">Alamat</TableHead>
                          <TableHead className="px-1 sm:px-2 min-w-[60px] sm:min-w-[100px]">Desa</TableHead>
                          <TableHead className="px-1 sm:px-2 min-w-[60px] sm:min-w-[100px]">Kecamatan</TableHead>
                          <TableHead className="px-1 sm:px-2 min-w-[100px] sm:min-w-[180px]">Status</TableHead>
                          <TableHead className="px-1 sm:px-2 min-w-[100px] sm:min-w-[170px]">Keterangan</TableHead>
                          <TableHead className="px-1 sm:px-2 min-w-[100px] sm:min-w-[160px]">Pengelompokan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={11}
                              className="text-center py-10 text-muted-foreground"
                            >
                              Tidak ada data yang sesuai filter.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedData.map((item) => (
                            <TableRow key={item.no} className="hover:bg-muted/30">
                              <TableCell className="text-center text-muted-foreground font-mono px-1 sm:px-2">
                                {item.no}
                              </TableCell>
                              <TableCell className="font-medium px-1 sm:px-2 whitespace-nowrap truncate max-w-[80px] sm:max-w-none sm:whitespace-normal" title={item.nama}>
                                {item.nama}
                              </TableCell>
                              <TableCell className="text-center px-1">
                                <Badge
                                  variant={item.jenisKelamin === "L" ? "default" : "secondary"}
                                  className="text-[10px] px-1 py-0 sm:text-xs sm:px-1.5 sm:py-0.5"
                                >
                                  {item.jenisKelamin}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground px-1 sm:px-2 whitespace-nowrap" title={item.noKtp || ""}>
                                {item.noKtp || "-"}
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground px-1 sm:px-2 whitespace-nowrap" title={item.noKk || ""}>
                                {item.noKk || "-"}
                              </TableCell>
                              <TableCell className="px-1 sm:px-2 whitespace-normal max-w-[110px] sm:max-w-none leading-tight" title={item.alamat}>
                                {item.alamat}
                              </TableCell>
                              <TableCell className="px-1 sm:px-2 whitespace-nowrap truncate max-w-[70px] sm:max-w-none sm:whitespace-normal" title={item.desa}>
                                {item.desa}
                              </TableCell>
                              <TableCell className="px-1 sm:px-2 whitespace-nowrap truncate max-w-[70px] sm:max-w-none sm:whitespace-normal" title={item.kecamatan}>
                                {item.kecamatan}
                              </TableCell>
                              <TableCell className="px-1 sm:px-2 whitespace-normal max-w-[120px] sm:max-w-none">
                                {item.status ? (
                                  <span className="text-muted-foreground leading-tight" title={item.status}>
                                    {item.status.length > 50
                                      ? item.status.slice(0, 47) + "…"
                                      : item.status}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="px-1 sm:px-2 whitespace-normal max-w-[120px] sm:max-w-none">
                                {item.keterangan ? (
                                  <Badge
                                    variant={
                                      item.keterangan.includes("Backlog 1")
                                        ? "destructive"
                                        : item.keterangan.includes("Backlog 2")
                                        ? "default"
                                        : "outline"
                                    }
                                    className="text-[10px] sm:text-xs whitespace-normal leading-tight"
                                  >
                                    {item.keterangan.length > 35
                                      ? item.keterangan.slice(0, 32) + "…"
                                      : item.keterangan}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="px-1 sm:px-2 whitespace-normal max-w-[120px] sm:max-w-none">
                                {item.pengelompokanDesil &&
                                item.pengelompokanDesil !== "-" ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] sm:text-xs whitespace-normal leading-tight"
                                  >
                                    {item.pengelompokanDesil}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-sm px-4 pb-4">
                    <p className="text-muted-foreground">
                      Halaman {clampedPage} dari {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 rounded-md border text-xs disabled:opacity-50 hover:bg-muted transition"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={clampedPage === 1}
                      >
                        ← Sebelumnya
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-md border text-xs disabled:opacity-50 hover:bg-muted transition"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={clampedPage === totalPages}
                      >
                        Selanjutnya →
                      </button>
                    </div>
                  </div>
                )}
              </Card>
          </TabsContent>

          {/* Tab 3: Data Perdesa */}
          <TabsContent value="data-desa" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Data Perdesa - Alokasi & TFL</CardTitle>
                <CardDescription>
                  Informasi alokasi per desa beserta TFL Teknik dan Pemberdayaan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-12 text-center">No</TableHead>
                          <TableHead className="min-w-[140px]">Desa</TableHead>
                          <TableHead className="min-w-[120px]">Kecamatan</TableHead>
                          <TableHead className="w-24 text-center">Alokasi</TableHead>
                          <TableHead className="w-24 text-center">Total</TableHead>
                          <TableHead className="min-w-[120px] sm:min-w-[180px]">TFL Teknik</TableHead>
                          <TableHead className="min-w-[120px] sm:min-w-[180px]">TFL Pemberdayaan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.perdesaData.map((item) => (
                          <TableRow key={item.no} className="hover:bg-muted/30">
                            <TableCell className="text-center text-muted-foreground font-mono text-xs">
                              {item.no}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.namaDesa}
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.namaKecamatan}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {item.jumlahAlokasi}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.totalAlokasi ?? "-"}
                            </TableCell>
                            <TableCell className="text-[11px] sm:text-xs">
                              {item.tflTeknik === "-" ? (
                                <span className="text-muted-foreground">-</span>
                              ) : (
                                <span className="font-medium">{item.tflTeknik}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-[11px] sm:text-xs">
                              {item.tflPemberdayaan === "-" ? (
                                <span className="text-muted-foreground">-</span>
                              ) : (
                                <span className="font-medium">{item.tflPemberdayaan}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                              {/* Tab 4: Data TFL */}
          <TabsContent value="data-tfl" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <StatCard
                icon={Wrench}
                label="Kelompok TFL"
                value={data.tflPairData.length}
                sub={`${data.tflPairData.filter(p => p.tflTeknik !== "-" && p.tflPemberdayaan !== "-").length} pasangan, ${data.tflPairData.filter(p => p.tflTeknik === "-" || p.tflPemberdayaan === "-").length} tanpa pasangan`}
                color="bg-gradient-to-br from-teal-500 to-teal-600"
              />
              <StatCard
                icon={Building2}
                label="Desa Tertangani"
                value={data.tflPairData.reduce((s, t) => s + t.desaList.length, 0)}
                sub="dari 45 desa total"
                color="bg-gradient-to-br from-amber-500 to-amber-600"
              />
              <StatCard
                icon={Users}
                label="Penerima TFL"
                value={data.tflPairData.reduce((s, t) => s + t.penerimaCount, 0)}
                sub={`dari ${data.summary.totalPenerima} total`}
                color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              />
              <StatCard
                icon={Wrench}
                label="TFL Teknik"
                value={data.tflPairData.filter(p => p.tflTeknik !== "-").length}
                sub={`${data.tflPairData.filter(p => p.tflPemberdayaan !== "-").length} TFL Pemberdayaan`}
                color="bg-gradient-to-br from-rose-500 to-rose-600"
              />
            </div>

            {/* TFL List - Accordion */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Data TFL Teknik & Pemberdayaan</CardTitle>
                <CardDescription>
                  {data.tflPairData.length} kelompok TFL — klik untuk melihat data penerima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {data.tflPairData.map((pair, idx) => {
                    return (
                    <AccordionItem key={`tfl-${idx}`} value={`tfl-${idx}`} className="rounded-xl border px-4 bg-white">
                      <AccordionTrigger className="py-3 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-left flex-1">
                          {/* TFL Teknik */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Wrench className="h-4 w-4 flex-shrink-0 text-teal-600" />
                            <span className={`text-sm truncate ${pair.tflTeknik === "-" ? "text-muted-foreground italic" : "font-semibold"}`}>{pair.tflTeknik === "-" ? "-" : pair.tflTeknik}</span>
                          </div>
                          {/* Separator */}
                          <span className="text-muted-foreground text-xs hidden sm:inline">&</span>
                          {/* TFL Pemberdayaan */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <HandHelping className="h-4 w-4 flex-shrink-0 text-rose-600" />
                            <span className={`text-sm truncate ${pair.tflPemberdayaan === "-" ? "text-muted-foreground italic" : "font-semibold"}`}>{pair.tflPemberdayaan === "-" ? "-" : pair.tflPemberdayaan}</span>
                          </div>
                          {/* Badge */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 w-fit">
                            <Badge className="text-[10px] bg-emerald-600">
                              {pair.penerimaCount} penerima · {pair.desaList.length} desa
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-3 pb-4 space-y-3">
                        {/* Desa Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {pair.desaList.map((d) => (
                            <Badge key={d} variant="outline" className="text-[10px] font-normal">
                              {d}
                            </Badge>
                          ))}
                        </div>
                        {/* Data Penerima Table */}
                        <div className="rounded-lg border overflow-x-auto">
                          <Table className="text-[11px] sm:text-xs md:text-sm">
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="w-10 text-center px-1">No</TableHead>
                                <TableHead className="px-1 sm:px-2 min-w-[70px] sm:min-w-[100px]">Nama</TableHead>
                                <TableHead className="px-1 sm:px-2 font-mono min-w-[90px] sm:min-w-[145px]">NIK</TableHead>
                                <TableHead className="px-1 sm:px-2 font-mono min-w-[90px] sm:min-w-[145px]">No KK</TableHead>
                                <TableHead className="px-1 sm:px-2 min-w-[90px] sm:min-w-[180px]">Alamat</TableHead>
                                <TableHead className="px-1 sm:px-2 min-w-[60px] sm:min-w-[100px]">Desa</TableHead>
                                <TableHead className="px-1 sm:px-2 min-w-[60px] sm:min-w-[100px]">Kecamatan</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pair.members.map((m, mi) => (
                                <TableRow key={mi} className="hover:bg-muted/30">
                                  <TableCell className="text-center text-muted-foreground font-mono px-1">{mi + 1}</TableCell>
                                  <TableCell className="font-medium px-1 sm:px-2 whitespace-nowrap" title={m.nama}>{m.nama}</TableCell>
                                  <TableCell className="font-mono text-muted-foreground px-1 sm:px-2 whitespace-nowrap" title={m.noKtp || ""}>
                                    {m.noKtp || "-"}
                                  </TableCell>
                                  <TableCell className="font-mono text-muted-foreground px-1 sm:px-2 whitespace-nowrap" title={m.noKk || ""}>
                                    {m.noKk || "-"}
                                  </TableCell>
                                  <TableCell className="px-1 sm:px-2 whitespace-normal max-w-[120px] sm:max-w-none leading-tight" title={m.alamat}>{m.alamat}</TableCell>
                                  <TableCell className="px-1 sm:px-2 whitespace-nowrap" title={m.desa}>{m.desa}</TableCell>
                                  <TableCell className="px-1 sm:px-2 whitespace-nowrap" title={m.kecamatan}>{m.kecamatan}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    );
                    })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Per Kecamatan */}
          <TabsContent value="data-kecamatan" className="space-y-4">
            <AlokasiKecamatanChart data={data.alokasiPerKecamatan} />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Alokasi Per Kecamatan</CardTitle>
                <CardDescription>
                  Ringkasan alokasi per kecamatan beserta daftar desa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-12 text-center">No</TableHead>
                          <TableHead className="min-w-[160px]">Kecamatan</TableHead>
                          <TableHead className="w-24 text-center">Jumlah Desa</TableHead>
                          <TableHead className="w-28 text-center">
                            Total Alokasi
                          </TableHead>
                          <TableHead className="min-w-[300px]">Daftar Desa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.alokasiPerKecamatan.map((item, idx) => (
                          <TableRow key={item.name} className="hover:bg-muted/30">
                            <TableCell className="text-center text-muted-foreground font-mono text-xs">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">
                              {item.desaCount}
                            </TableCell>
                            <TableCell className="text-center font-bold text-lg">
                              {item.total}
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex flex-wrap gap-1.5">
                                {item.desaList.map((desa) => (
                                  <Badge
                                    key={desa}
                                    variant="outline"
                                    className="text-xs font-normal"
                                  >
                                    {desa}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
          <p>
            Dashboard BSPS 2026 Tahap IV · Kab. Bandung · Direktorat Jenderal
            Perumahan Perdesaan
          </p>
          <p className="mt-0.5 font-medium text-foreground/70">By Ujang Supriatna</p>
        </div>
      </footer>
    </div>
  );
}
