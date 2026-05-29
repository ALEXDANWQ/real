import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useDisableIosPullToRefresh } from "@/hooks/use-disable-ios-pull-to-refresh";

const queryClient = new QueryClient();

function resolveRouterBaseName() {
  const configuredBase = import.meta.env.BASE_URL;
  if (configuredBase && configuredBase !== "/" && configuredBase !== "./") {
    return configuredBase.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  const hostname = window.location.hostname.toLowerCase();
  if (!hostname.endsWith(".github.io")) {
    return undefined;
  }

  const [repoSegment] = window.location.pathname.split("/").filter(Boolean);
  return repoSegment ? `/${repoSegment}` : undefined;
}

const routerBaseName = resolveRouterBaseName();

const App = () => {
  useDisableIosPullToRefresh();

  useEffect(() => {
    const blockContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", blockContextMenu);
    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={routerBaseName}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
