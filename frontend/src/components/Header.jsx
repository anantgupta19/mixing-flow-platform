import React from "react";
import {
  Activity,
  GitBranch,
} from "lucide-react";


export default function Header() {
  return (
    <header className="site-header">

      {/* Brand */}
      <a
        href="#top"
        className="brand"
        aria-label="FluidMix AI home"
      >

        <div className="brand-icon">
          <Activity size={23} strokeWidth={1.8} />
        </div>

        <div className="brand-text">

          <span className="brand-title">
            FLUIDMIX AI
          </span>

          <span className="brand-subtitle">
            Spatial Mixing Prediction Platform
          </span>

        </div>

      </a>


      {/* Navigation */}
      <nav className="nav-links">

        <a href="#prediction">
          Prediction
        </a>

        <a href="#methodology">
          Methodology
        </a>

        <a href="#about">
          About
        </a>

        <a
          href="https://github.com/anantgupta19/mixing-flow-platform"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >

          <GitBranch size={18} />

          <span>
            GitHub
          </span>

        </a>

      </nav>

    </header>
  );
}