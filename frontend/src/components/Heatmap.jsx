import React, { useMemo, useRef, useState } from "react";
import { Download, X } from "lucide-react";


function jetColor(value) {
  const v = Math.max(0, Math.min(1, value));

  let r;
  let g;
  let b;

  if (v < 0.25) {
    const t = v / 0.25;
    r = 0;
    g = Math.round(255 * t);
    b = 255;
  } else if (v < 0.5) {
    const t = (v - 0.25) / 0.25;
    r = 0;
    g = 255;
    b = Math.round(255 * (1 - t));
  } else if (v < 0.75) {
    const t = (v - 0.5) / 0.25;
    r = Math.round(255 * t);
    g = 255;
    b = 0;
  } else {
    const t = (v - 0.75) / 0.25;
    r = 255;
    g = Math.round(255 * (1 - t));
    b = 0;
  }

  return `rgb(${r}, ${g}, ${b})`;
}


function textColor(value) {
  return value > 0.62 ? "#111827" : "#ffffff";
}


export default function Heatmap({
  prediction,
  inputs,
  onClose,
}) {
  const svgRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const grid = prediction?.grid || [];

  const statistics = prediction?.statistics || {};

  const svgWidth = 980;
  const svgHeight = 780;

  const plotX = 125;
  const plotY = 80;

  const plotSize = 560;

  const cellSize = plotSize / 15;

  const colorbarX = 755;
  const colorbarY = plotY;
  const colorbarWidth = 30;
  const colorbarHeight = plotSize;

  const min = 0;
  const max = 1;

  const cells = useMemo(() => {
    const result = [];

    if (!grid.length) {
      return result;
    }

    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        const value = grid[row]?.[col];

        if (value === null || value === undefined) {
          continue;
        }

        const x = plotX + col * cellSize;

        // Reverse row because SVG y increases downward,
        // while the original matplotlib plot has y increasing upward.
        const y =
          plotY +
          (14 - row) * cellSize;

        result.push({
          row,
          col,
          x,
          y,
          value,
        });
      }
    }

    return result;
  }, [grid, cellSize]);


  const downloadPNG = async () => {
    if (!svgRef.current) return;

    setDownloading(true);

    try {
      const svg = svgRef.current;

      const serializer = new XMLSerializer();

      let source = serializer.serializeToString(svg);

      if (!source.includes("xmlns=")) {
        source = source.replace(
          "<svg",
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }

      const svgBlob = new Blob(
        [source],
        {
          type: "image/svg+xml;charset=utf-8",
        }
      );

      const url = URL.createObjectURL(svgBlob);

      const image = new Image();

      image.onload = () => {
        const scale = 4;

        const canvas = document.createElement("canvas");

        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        URL.revokeObjectURL(url);

        const link =
          document.createElement("a");

        link.download =
          "predicted_mixing_pattern.png";

        link.href =
          canvas.toDataURL("image/png");

        link.click();

        setDownloading(false);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        setDownloading(false);
      };

      image.src = url;
    } catch (error) {
      console.error(
        "PNG download failed:",
        error
      );

      setDownloading(false);
    }
  };


  if (!prediction || !grid.length) {
    return null;
  }


  return (
    <div
      className="heatmap-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="heatmap-modal">

        {/* Header */}
        <div className="heatmap-modal-header">

          <div>
            <div className="heatmap-eyebrow">
              PREDICTION RESULT
            </div>

            <h2>
              Predicted Mixing Pattern
            </h2>

            <p>
              Normalized concentration
              distribution across the
              mixing chamber
            </p>
          </div>

          <button
            className="heatmap-close"
            onClick={onClose}
            aria-label="Close prediction"
          >
            <X size={22} />
          </button>

        </div>


        {/* Scientific plot */}
        <div className="scientific-plot-wrapper">

          <svg
            ref={svgRef}
            className="scientific-plot"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            xmlns="http://www.w3.org/2000/svg"
          >

            {/* White background */}
            <rect
              x="0"
              y="0"
              width={svgWidth}
              height={svgHeight}
              fill="white"
            />


            {/* Title */}
            <text
              x={svgWidth / 2}
              y="42"
              textAnchor="middle"
              fontSize="28"
              fontWeight="600"
              fill="#111111"
            >
              Predicted Mixing Pattern
            </text>


            {/* Plot background */}
            <rect
              x={plotX}
              y={plotY}
              width={plotSize}
              height={plotSize}
              fill="white"
              stroke="#222222"
              strokeWidth="1.5"
            />


            {/* Heatmap cells */}
            {cells.map((cell) => (
              <rect
                key={`${cell.row}-${cell.col}`}
                x={cell.x}
                y={cell.y}
                width={cellSize + 0.3}
                height={cellSize + 0.3}
                fill={jetColor(cell.value)}
                shapeRendering="crispEdges"
              />
            ))}


            {/* Grid boundaries */}
            {Array.from(
              { length: 16 },
              (_, i) => (
                <line
                  key={`vertical-${i}`}
                  x1={
                    plotX +
                    i * cellSize
                  }
                  y1={plotY}
                  x2={
                    plotX +
                    i * cellSize
                  }
                  y2={
                    plotY +
                    plotSize
                  }
                  stroke="#ffffff"
                  strokeOpacity="0.10"
                  strokeWidth="0.7"
                />
              )
            )}

            {Array.from(
              { length: 16 },
              (_, i) => (
                <line
                  key={`horizontal-${i}`}
                  x1={plotX}
                  y1={
                    plotY +
                    i * cellSize
                  }
                  x2={
                    plotX +
                    plotSize
                  }
                  y2={
                    plotY +
                    i * cellSize
                  }
                  stroke="#ffffff"
                  strokeOpacity="0.10"
                  strokeWidth="0.7"
                />
              )
            )}


            {/* X-axis ticks */}
            {Array.from(
              { length: 15 },
              (_, i) => (
                <g key={`x-${i}`}>

                  <line
                    x1={
                      plotX +
                      (i + 0.5) *
                        cellSize
                    }
                    y1={
                      plotY +
                      plotSize
                    }
                    x2={
                      plotX +
                      (i + 0.5) *
                        cellSize
                    }
                    y2={
                      plotY +
                      plotSize +
                      7
                    }
                    stroke="#111111"
                    strokeWidth="1"
                  />

                  <text
                    x={
                      plotX +
                      (i + 0.5) *
                        cellSize
                    }
                    y={
                      plotY +
                      plotSize +
                      25
                    }
                    textAnchor="middle"
                    fontSize="14"
                    fill="#111111"
                  >
                    {i}
                  </text>

                </g>
              )
            )}


            {/* Y-axis ticks */}
            {Array.from(
              { length: 15 },
              (_, i) => (
                <g key={`y-${i}`}>

                  <line
                    x1={plotX - 7}
                    y1={
                      plotY +
                      (14 - i + 0.5) *
                        cellSize
                    }
                    x2={plotX}
                    y2={
                      plotY +
                      (14 - i + 0.5) *
                        cellSize
                    }
                    stroke="#111111"
                    strokeWidth="1"
                  />

                  <text
                    x={plotX - 16}
                    y={
                      plotY +
                      (14 - i + 0.5) *
                        cellSize +
                      5
                    }
                    textAnchor="end"
                    fontSize="14"
                    fill="#111111"
                  >
                    {i}
                  </text>

                </g>
              )
            )}


            {/* X-axis label */}
            <text
              x={
                plotX +
                plotSize / 2
              }
              y={
                plotY +
                plotSize +
                62
              }
              textAnchor="middle"
              fontSize="20"
              fill="#111111"
            >
              Receiver
            </text>


            {/* Y-axis label */}
            <text
              x="38"
              y={
                plotY +
                plotSize / 2
              }
              textAnchor="middle"
              fontSize="20"
              fill="#111111"
              transform={`
                rotate(
                  -90,
                  38,
                  ${plotY + plotSize / 2}
                )
              `}
            >
              Transmitter
            </text>


            {/* ------------------------------------------------ */}
            {/* INLET 2 — LEFT / UPPER                           */}
            {/* ------------------------------------------------ */}

            <line
              x1="42"
              y1={
                plotY +
                (14 - 11.5) *
                  cellSize
              }
              x2={plotX}
              y2={
                plotY +
                (14 - 11.5) *
                  cellSize
              }
              stroke="#111111"
              strokeWidth="3"
            />

            <polygon
              points={`
                ${plotX},
                ${plotY +
                  (14 - 11.5) *
                    cellSize}
                ${plotX - 16},
                ${plotY +
                  (14 - 11.5) *
                    cellSize -
                  9}
                ${plotX - 16},
                ${plotY +
                  (14 - 11.5) *
                    cellSize +
                  9}
              `}
              fill="#111111"
            />

            <text
              x="15"
              y={
                plotY +
                (14 - 11.5) *
                  cellSize -
                10
              }
              fontSize="20"
              fontWeight="600"
              fill="#111111"
            >
              I2
            </text>


            {/* ------------------------------------------------ */}
            {/* INLET 3 — RIGHT / UPPER                          */}
            {/* ------------------------------------------------ */}

            <line
              x1={
                plotX +
                plotSize
              }
              y1={
                plotY +
                (14 - 11.5) *
                  cellSize
              }
              x2="735"
              y2={
                plotY +
                (14 - 11.5) *
                  cellSize
              }
              stroke="#111111"
              strokeWidth="3"
            />

            <polygon
              points={`
                ${plotX +
                  plotSize},
                ${plotY +
                  (14 - 11.5) *
                    cellSize}
                ${plotX +
                  plotSize +
                  16},
                ${plotY +
                  (14 - 11.5) *
                    cellSize -
                  9}
                ${plotX +
                  plotSize +
                  16},
                ${plotY +
                  (14 - 11.5) *
                    cellSize +
                  9}
              `}
              fill="#111111"
            />

            <text
              x="795"
              y={
                plotY +
                (14 - 11.5) *
                  cellSize -
                10
              }
              fontSize="20"
              fontWeight="600"
              fill="#111111"
            >
              I3
            </text>


            {/* ------------------------------------------------ */}
            {/* INLET 1 — LEFT / LOWER                           */}
            {/* ------------------------------------------------ */}

            <line
              x1="42"
              y1={
                plotY +
                (14 - 4.5) *
                  cellSize
              }
              x2={plotX}
              y2={
                plotY +
                (14 - 4.5) *
                  cellSize
              }
              stroke="#111111"
              strokeWidth="3"
            />

            <polygon
              points={`
                ${plotX},
                ${plotY +
                  (14 - 4.5) *
                    cellSize}
                ${plotX - 16},
                ${plotY +
                  (14 - 4.5) *
                    cellSize -
                  9}
                ${plotX - 16},
                ${plotY +
                  (14 - 4.5) *
                    cellSize +
                  9}
              `}
              fill="#111111"
            />

            <text
              x="15"
              y={
                plotY +
                (14 - 4.5) *
                  cellSize +
                28
              }
              fontSize="20"
              fontWeight="600"
              fill="#111111"
            >
              I1
            </text>


            {/* ------------------------------------------------ */}
            {/* INLET 4 — RIGHT / LOWER                          */}
            {/* ------------------------------------------------ */}

            <line
              x1={
                plotX +
                plotSize
              }
              y1={
                plotY +
                (14 - 4.5) *
                  cellSize
              }
              x2="735"
              y2={
                plotY +
                (14 - 4.5) *
                  cellSize
              }
              stroke="#111111"
              strokeWidth="3"
            />

            <polygon
              points={`
                ${plotX +
                  plotSize},
                ${plotY +
                  (14 - 4.5) *
                    cellSize}
                ${plotX +
                  plotSize +
                  16},
                ${plotY +
                  (14 - 4.5) *
                    cellSize -
                  9}
                ${plotX +
                  plotSize +
                  16},
                ${plotY +
                  (14 - 4.5) *
                    cellSize +
                  9}
              `}
              fill="#111111"
            />

            <text
              x="795"
              y={
                plotY +
                (14 - 4.5) *
                  cellSize +
                28
              }
              fontSize="20"
              fontWeight="600"
              fill="#111111"
            >
              I4
            </text>


            {/* ------------------------------------------------ */}
            {/* COLORBAR                                         */}
            {/* ------------------------------------------------ */}

            <defs>
              <linearGradient
                id="concentrationGradient"
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="rgb(0,0,255)"
                />
                <stop
                  offset="25%"
                  stopColor="rgb(0,255,255)"
                />
                <stop
                  offset="50%"
                  stopColor="rgb(0,255,0)"
                />
                <stop
                  offset="75%"
                  stopColor="rgb(255,255,0)"
                />
                <stop
                  offset="100%"
                  stopColor="rgb(255,0,0)"
                />
              </linearGradient>
            </defs>

            <rect
              x={colorbarX}
              y={colorbarY}
              width={colorbarWidth}
              height={colorbarHeight}
              fill="url(#concentrationGradient)"
              stroke="#111111"
              strokeWidth="1"
            />


            {/* Colorbar title */}
            <text
              x={colorbarX + 15}
              y="55"
              textAnchor="middle"
              fontSize="17"
              fontWeight="500"
              fill="#111111"
            >
              Concentration
            </text>


            {/* Colorbar ticks */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(
              (value) => {

                const y =
                  colorbarY +
                  colorbarHeight -
                  value *
                    colorbarHeight;

                return (
                  <g key={value}>

                    <line
                      x1={
                        colorbarX +
                        colorbarWidth
                      }
                      y1={y}
                      x2={
                        colorbarX +
                        colorbarWidth +
                        7
                      }
                      y2={y}
                      stroke="#111111"
                      strokeWidth="1"
                    />

                    <text
                      x={
                        colorbarX +
                        colorbarWidth +
                        14
                      }
                      y={y + 5}
                      fontSize="14"
                      fill="#111111"
                    >
                      {value.toFixed(1)}
                    </text>

                  </g>
                );
              }
            )}


            {/* Inlet values */}
            <text
              x="42"
              y="720"
              fontSize="14"
              fill="#333333"
            >
              I1 = {Number(inputs?.[0] ?? 0).toFixed(4)}
            </text>

            <text
              x="220"
              y="720"
              fontSize="14"
              fill="#333333"
            >
              I2 = {Number(inputs?.[1] ?? 0).toFixed(4)}
            </text>

            <text
              x="398"
              y="720"
              fontSize="14"
              fill="#333333"
            >
              I3 = {Number(inputs?.[2] ?? 0).toFixed(4)}
            </text>

            <text
              x="576"
              y="720"
              fontSize="14"
              fill="#333333"
            >
              I4 = {Number(inputs?.[3] ?? 0).toFixed(4)}
            </text>


            {/* Statistics */}
            <text
              x="755"
              y="680"
              fontSize="14"
              fill="#333333"
            >
              Min:{" "}
              {Number(
                statistics.minimum ?? 0
              ).toFixed(4)}
            </text>

            <text
              x="755"
              y="700"
              fontSize="14"
              fill="#333333"
            >
              Max:{" "}
              {Number(
                statistics.maximum ?? 0
              ).toFixed(4)}
            </text>

            <text
              x="755"
              y="720"
              fontSize="14"
              fill="#333333"
            >
              Mean:{" "}
              {Number(
                statistics.mean ?? 0
              ).toFixed(4)}
            </text>

          </svg>

        </div>


        {/* Footer */}
        <div className="heatmap-modal-footer">

          <div className="heatmap-footer-info">
            <strong>
              FluidMix AI
            </strong>

            <span>
              15 × 15 spatial grid ·
              193 valid cells
            </span>
          </div>


          <button
            className="download-png-button"
            onClick={downloadPNG}
            disabled={downloading}
          >
            <Download size={18} />

            {downloading
              ? "Preparing PNG..."
              : "Download PNG"}
          </button>

        </div>

      </div>
    </div>
  );
}