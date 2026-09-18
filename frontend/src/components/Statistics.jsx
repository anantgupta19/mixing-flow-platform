import {
  Activity,
  Grid3X3,
  TrendingUp,
  Target,
} from "lucide-react";

function Statistics({ prediction }) {
  if (!prediction) {
    return null;
  }

  const values = prediction.prediction || [];

  const numericValues = values
    .map(Number)
    .filter(Number.isFinite);

  const min =
    numericValues.length
      ? Math.min(...numericValues)
      : 0;

  const max =
    numericValues.length
      ? Math.max(...numericValues)
      : 0;

  const mean =
    numericValues.length
      ? numericValues.reduce((a, b) => a + b, 0) /
        numericValues.length
      : 0;

  const statistics = [
    {
      label: "Minimum",
      value: min.toFixed(4),
      icon: TrendingUp,
    },
    {
      label: "Maximum",
      value: max.toFixed(4),
      icon: TrendingUp,
    },
    {
      label: "Mean",
      value: mean.toFixed(4),
      icon: Activity,
    },
    {
      label: "Valid cells",
      value: prediction.valid_cells || 193,
      icon: Grid3X3,
    },
  ];

  return (
    <section className="statistics">

      <div className="section-heading">
        <div>
          <span className="eyebrow">PREDICTION STATISTICS</span>
          <h2>Output summary</h2>
        </div>
      </div>

      <div className="statistics-grid">

        {statistics.map(
          ({ label, value, icon: Icon }) => (
            <div className="stat-card" key={label}>

              <div className="stat-icon">
                <Icon size={18} />
              </div>

              <span className="stat-label">
                {label}
              </span>

              <strong className="stat-value">
                {value}
              </strong>

            </div>
          )
        )}

      </div>

    </section>
  );
}

export default Statistics;