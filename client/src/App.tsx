import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

import { Home } from "@/pages/Home";
import { CalendarPage } from "@/pages/CalendarPage";
import { AppsPage } from "@/pages/AppsPage";
import { MessagesPage } from "@/pages/MessagesPage";
import { TasksPage } from "@/pages/TasksPage";
import { AIPage } from "@/pages/AIPage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/apps" component={AppsPage} />
        <Route path="/messages" component={MessagesPage} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/ai" component={AIPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
