"use client";

import { useState } from "react";
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

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    window.electron.navigate(url);
  };

  const handleBack = () => {
    window.electron.navigateBack();
  };

  const handleForward = () => {
    window.electron.navigateForward();
  };

  const handleRefresh = () => {
    window.electron.refresh();
  };

  return (
    <header className="main-header">
      <Left>
        <Nav />
        <button onClick={handleBack}>Back</button>
        <button onClick={handleForward}>Forward</button>
        <button onClick={handleRefresh}>Refresh</button>
        <form onSubmit={handleUrlSubmit}>
          <input type="text" value={url} onChange={handleUrlChange} />
        </form>
      </Left>
      {/* <small></small> */}
      <Right>{path !== "/about" && <Link href="/bout">~ 2024</Link>}</Right>
    </header>
  );
}
