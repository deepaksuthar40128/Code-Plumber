import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/theme-provider";
import Loader from "./components/Loader/Loader";
import ErrorBoundary from "./components/Error/Boundary";

const Home = React.lazy(() => import("./pages/Home"));
const Compiler = React.lazy(() => import("./pages/Compiler"));

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Header />
      <Suspense fallback={<Loader />}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compiler/*"  element={<Compiler />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
