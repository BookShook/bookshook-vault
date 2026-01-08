import { Link, Route, Routes, useLocation } from "react-router-dom";
import { MeProvider, useMe } from "./auth/MeContext";
import { AuthorProvider } from "./auth/AuthorContext";
import { AdminProvider } from "./auth/AdminContext";
import Layout from "./components/Layout";
import { AuthorLayout } from "./components/author/AuthorLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import LibraryPage from "./pages/LibraryPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import { AuthorLoginPage } from "./pages/author/AuthorLoginPage";
import { AuthorDashboard } from "./pages/author/AuthorDashboard";
import { AuthorBookDetail } from "./pages/author/AuthorBookDetail";
import { AuthorSubmissions } from "./pages/author/AuthorSubmissions";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminSubmissions } from "./pages/admin/AdminSubmissions";
import { AdminProposals } from "./pages/admin/AdminProposals";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid rgba(0,0,0,.12)", borderRadius: 16, padding: 16, background: "#fff" }}>
      {children}
    </div>
  );
}

function Home() {
  const { me, isLoading, isAuthenticated, isPaid } = useMe();

  return (
    <Card>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Vault (React)</div>
      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        Welcome to your BookShook Vault. Browse your library below.
      </div>

      <div style={{ fontWeight: 800, marginBottom: 8 }}>/api/me</div>
      <pre style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,.05)", overflow: "auto" }}>
        {isLoading ? "Loading..." : JSON.stringify(me, null, 2)}
      </pre>

      {isAuthenticated && me && me.isAuthenticated && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={pillStyle}>member: {me.ghostMemberId}</span>
          <span style={pillStyle}>paid: {isPaid ? "yes" : "no"}</span>
          <span style={pillStyle}>tiers: {me.tiers.length}</span>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Link to="/books" style={{ fontWeight: 600, color: "#000" }}>
          Browse Books
        </Link>
      </div>
    </Card>
  );
}

function NotFound() {
  const loc = useLocation();
  return (
    <Card>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Not Found</div>
      <div style={{ opacity: 0.8 }}>No route for: {loc.pathname}</div>
    </Card>
  );
}

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,.12)",
  fontSize: 12,
};

function AuthorRoutes() {
  return (
    <AuthorProvider>
      <Routes>
        <Route path="login" element={<AuthorLoginPage />} />
        <Route element={<AuthorLayout />}>
          <Route index element={<AuthorDashboard />} />
          <Route path="books/:bookId" element={<AuthorBookDetail />} />
          <Route path="submissions" element={<AuthorSubmissions />} />
        </Route>
      </Routes>
    </AuthorProvider>
  );
}

function AdminRoutes() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="proposals" element={<AdminProposals />} />
        </Route>
      </Routes>
    </AdminProvider>
  );
}

function MainRoutes() {
  return (
    <MeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:slug" element={<BookDetailPage />} />
          <Route path="/collections" element={<div style={{ padding: 24 }}>Collections coming soon</div>} />
          <Route path="/collections/:slug" element={<div style={{ padding: 24 }}>Collection detail coming soon</div>} />
          <Route path="/my/library" element={<LibraryPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </MeProvider>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin Portal */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      {/* Author Portal */}
      <Route path="/author/*" element={<AuthorRoutes />} />
      {/* Main Vault App */}
      <Route path="*" element={<MainRoutes />} />
    </Routes>
  );
}
