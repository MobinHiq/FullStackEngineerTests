import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./components/Dashboard";
import { ConfigurationList } from "./components/ConfigurationList";
import { ConfigurationEdit } from "./components/ConfigurationEdit";
import { ConfigurationCreate } from "./components/ConfigurationCreate";
import { Toaster } from "react-hot-toast";
import { ConfigurationProvider } from "./contexts/ConfigurationContext";
import "./custom.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import cartoonTheme from "./theme/cartoonTheme";

function App() {
  return (
    <ThemeProvider theme={cartoonTheme}>
      <CssBaseline />
      <ConfigurationProvider>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/configurations" element={<ConfigurationList />} />
            <Route path="/create" element={<ConfigurationCreate />} />
            <Route path="/edit/:id" element={<ConfigurationEdit />} />
          </Routes>
        </Layout>
      </ConfigurationProvider>
    </ThemeProvider>
  );
}

export default App;
