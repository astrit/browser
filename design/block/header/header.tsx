"use client";

import { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "@/link/link";
import Nav from "@/nav/nav";

import "@/header/header.css";

function Left({ children }: { children: ReactNode }) {
  return <div className="sides left">{children}</div>;
}

function Right({ children }: { children: ReactNode }) {
  return <div className="sides right">{children}</div>;
}

export default function Header() {
  const path = usePathname();
  const [url, setUrl] = useState(path);

  useEffect(() => {
    // Make sure the 'electron' object is available
    if (!window.electron) {
      console.error("Electron object is not available");
      return;
    }
  }, []);

  const navigate = (url: string) => {
    window.electron.navigate(url);
  };

  const navigateBack = () => {
    window.electron.navigateBack();
  };

  const navigateForward = () => {
    window.electron.navigateForward();
  };

  const refresh = () => {
    window.electron.refresh();
  };

  return (
    <header className="main-header">
      <Left>
        <Nav />
        {/* <button onClick={() => navigate("https://example.com")}>
          Go to example.com
        </button> */}
        <button onClick={() => window.electron.navigate("https://example.com")}>
          Go to example.com
        </button>
        <button onClick={navigateBack}>Back</button>
        <button onClick={navigateForward}>Forward</button>
        <button onClick={refresh}>Refresh</button>
      </Left>
      <Right>{path !== "/about" && <Link href="/bout">~ 2024</Link>}</Right>
    </header>
  );
}
