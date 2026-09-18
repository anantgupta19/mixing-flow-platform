import { useState } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";
import InputPanel from "./components/InputPanel";
import Statistics from "./components/Statistics";
import Heatmap from "./components/Heatmap";

import { predictMixing } from "./services/api";

import "./App.css";


function App() {

  // =========================================================
  // INPUT CONDITIONS
  // =========================================================

  const [inputs, setInputs] = useState({
    I1: 0.8,
    I2: 0.6,
    I3: 0.4,
    I4: 0.7,
  });


  // =========================================================
  // PREDICTION STATE
  // =========================================================

  const [prediction, setPrediction] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [showPlot, setShowPlot] = useState(false);


  // =========================================================
  // RUN PREDICTION
  // =========================================================

  const handlePredict = async () => {

    setLoading(true);

    setError("");

    try {

      const result = await predictMixing(inputs);

      console.log(
        "Prediction response:",
        result
      );

      // Store API result
      setPrediction(result);

      // Automatically open scientific plot
      setShowPlot(true);

    } catch (err) {

      console.error(
        "Prediction error:",
        err
      );

      setError(
        err?.message ||
        "Prediction failed. Please make sure the backend API is running."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // CLOSE PREDICTION PLOT
  // =========================================================

  const handleClosePlot = () => {
    setShowPlot(false);
  };


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <Header />


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main id="top">


        {/* ===================================================
            HERO SECTION
            =================================================== */}

        <section className="hero-section">

          <div className="hero-content">

            <div className="hero-badge">
              MACHINE LEARNING · CFD
            </div>


            <h1>
              Spatial Fluid Mixing

              <span>
                Pattern Prediction
              </span>
            </h1>


            <p>
              Predict normalized concentration
              distributions inside a fluid mixing
              chamber using four inlet flow
              conditions.
            </p>


            <div className="hero-metrics">

              <div>

                <strong>
                  193
                </strong>

                <span>
                  spatial cells
                </span>

              </div>


              <div>

                <strong>
                  15 × 15
                </strong>

                <span>
                  field resolution
                </span>

              </div>


              <div>

                <strong>
                  Polynomial Ridge
                </strong>

                <span>
                  ML model
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            PREDICTION WORKSPACE
            =================================================== */}

        <section
          id="prediction"
          className="workspace-section"
        >

          <div className="section-heading">

            <div>

              <span>
                PREDICTION WORKSPACE
              </span>


              <h2>
                Inlet flow rates
              </h2>


              <p>
                Enter the four inlet conditions
                and predict the spatial
                concentration field.
              </p>

            </div>

          </div>


          <div className="workspace-grid">

            {/* -------------------------------------------------
                INPUT PANEL
                ------------------------------------------------- */}

            <InputPanel
              inputs={inputs}
              setInputs={setInputs}
              onPredict={handlePredict}
              loading={loading}
            />


            {/* -------------------------------------------------
                QUICK INFORMATION
                ------------------------------------------------- */}

            <div className="quick-info-panel">

              <div className="info-card">

                <span>
                  GRID SIZE
                </span>

                <strong>
                  15 × 15
                </strong>

              </div>


              <div className="info-card">

                <span>
                  VALID CELLS
                </span>

                <strong>
                  193 / 225
                </strong>

              </div>


              <div className="info-card">

                <span>
                  OUTPUT
                </span>

                <strong>
                  Normalized concentration
                </strong>

              </div>

            </div>

          </div>


          {/* -------------------------------------------------
              ERROR
              ------------------------------------------------- */}

          {error && (

            <div className="prediction-error">

              {error}

            </div>

          )}


          {/* -------------------------------------------------
              STATISTICS
              ------------------------------------------------- */}

          {prediction && (

            <Statistics
              prediction={prediction}
            />

          )}

        </section>


        {/* ===================================================
            METHODOLOGY
            =================================================== */}

        <section
          id="methodology"
          className="content-section"
        >

          <div className="section-heading">

            <span>
              METHODOLOGY
            </span>


            <h2>
              From inlet conditions
              to spatial prediction
            </h2>

          </div>


          <div className="methodology-grid">


            {/* Step 01 */}

            <div className="method-card">

              <span>
                01
              </span>


              <h3>
                Input conditions
              </h3>


              <p>
                Four inlet flow rates I1–I4
                define the operating condition
                of the mixing chamber.
              </p>

            </div>


            {/* Step 02 */}

            <div className="method-card">

              <span>
                02
              </span>


              <h3>
                Machine learning
              </h3>


              <p>
                A Polynomial Ridge regression
                pipeline predicts concentration
                at 193 valid spatial locations.
              </p>

            </div>


            {/* Step 03 */}

            <div className="method-card">

              <span>
                03
              </span>


              <h3>
                Spatial reconstruction
              </h3>


              <p>
                The predicted values are
                reconstructed onto the original
                15 × 15 spatial geometry.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            ABOUT
            =================================================== */}

        <section
          id="about"
          className="content-section about-section"
        >

          <div>

            <span>
              ABOUT
            </span>


            <h2>
              FluidMix AI
            </h2>


            <p>
              An interactive machine-learning
              platform for predicting spatial
              fluid mixing patterns from inlet
              flow conditions.
            </p>

          </div>


          <div className="about-stats">


            <div>

              <strong>
                4
              </strong>

              <span>
                inlet variables
              </span>

            </div>


            <div>

              <strong>
                193
              </strong>

              <span>
                output cells
              </span>

            </div>


            <div>

              <strong>
                15×15
              </strong>

              <span>
                spatial field
              </span>

            </div>


          </div>

        </section>


      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <Footer />


      {/* =====================================================
          SCIENTIFIC PREDICTION MODAL
          ===================================================== */}

      {showPlot && prediction && (

        <Heatmap

          prediction={prediction}

          inputs={[
            Number(inputs.I1),
            Number(inputs.I2),
            Number(inputs.I3),
            Number(inputs.I4),
          ]}

          onClose={handleClosePlot}

        />

      )}

    </div>
  );
}


export default App;