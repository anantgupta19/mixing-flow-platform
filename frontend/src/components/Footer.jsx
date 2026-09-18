function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-content">

        <div>
          <strong>FLUIDMIX AI</strong>
          <span>
            Spatial Fluid Mixing Pattern Prediction
          </span>
        </div>

        <div className="footer-author">
          Built by <strong>Anant Dev Gupta</strong>
        </div>

      </div>

      <div className="footer-bottom">
        <span>
          Machine Learning · Fluid Dynamics
        </span>

        <span>
          © {new Date().getFullYear()} FluidMix AI
        </span>
      </div>

    </footer>
  );
}

export default Footer;