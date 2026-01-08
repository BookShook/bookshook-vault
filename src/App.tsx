import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MeProvider } from "./auth/MeContext";
import { AuthorProvider } from "./auth/AuthorContext";
import { AdminProvider } from "./auth/AdminContext";
import Layout from "./components/Layout";
import { AuthorLayout } from "./components/author/AuthorLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import TheDoor from "./pages/TheDoor";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import LibraryPage from "./pages/LibraryPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import CollectionsPage from "./pages/CollectionsPage";
import FridayPickPage from "./pages/FridayPickPage";
import MembershipPage from "./pages/MembershipPage";
import AboutPage from "./pages/AboutPage";
import { AuthorLoginPage } from "./pages/author/AuthorLoginPage";
import { AuthorDashboard } from "./pages/author/AuthorDashboard";
import { AuthorBookDetail } from "./pages/author/AuthorBookDetail";
import { AuthorSubmissions } from "./pages/author/AuthorSubmissions";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminSubmissions } from "./pages/admin/AdminSubmissions";
import { AdminProposals } from "./pages/admin/AdminProposals";


function NotFound() {
  const loc = useLocation();
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Not Found</div>
      <div style={{ opacity: 0.8 }}>No route for: {loc.pathname}</div>
    </div>
  );
}

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
      <Routes>
        {/* The Door - Landing page without Layout */}
        <Route path="/" element={<TheDoor />} />

        {/* Pages with Layout */}
        <Route path="/books" element={<Layout><BooksPage /></Layout>} />
        <Route path="/books/:slug" element={<Layout><BookDetailPage /></Layout>} />
        <Route path="/collections" element={<Layout><CollectionsPage /></Layout>} />
        <Route path="/collections/:slug" element={<Layout><div style={{ padding: 24 }}>Collection detail coming soon</div></Layout>} />
        <Route path="/my/library" element={<Layout><LibraryPage /></Layout>} />
        <Route path="/recommendations" element={<Layout><RecommendationsPage /></Layout>} />
        <Route path="/friday-pick" element={<Layout><FridayPickPage /></Layout>} />
        <Route path="/membership" element={<Layout><MembershipPage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
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
