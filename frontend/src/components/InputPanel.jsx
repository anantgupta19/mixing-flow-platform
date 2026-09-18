import React from "react";
import {
  RotateCcw,
  Sparkles,
} from "lucide-react";


const inletDefinitions = [
  {
    key: "I1",
    name: "I1",
    location: "Left Inlet",
  },
  {
    key: "I2",
    name: "I2",
    location: "Upper Inlet",
  },
  {
    key: "I3",
    name: "I3",
    location: "Right Inlet",
  },
  {
    key: "I4",
    name: "I4",
    location: "Lower Inlet",
  },
];


export default function InputPanel({
  inputs = {
    I1: 0.8,
    I2: 0.6,
    I3: 0.4,
    I4: 0.7,
  },

  setInputs,

  onPredict,

  loading = false,
}) {


  const handleChange = (key, value) => {

    const numericValue =
      value === ""
        ? ""
        : Number(value);

    setInputs((previous) => ({
      ...previous,
      [key]: numericValue,
    }));
  };


  const handleReset = () => {

    setInputs({
      I1: 0.8,
      I2: 0.6,
      I3: 0.4,
      I4: 0.7,
    });
  };


  const handleSubmit = (event) => {

    event.preventDefault();

    onPredict();
  };


  return (
    <div className="input-panel">

      <div className="input-panel-header">

        <div>
          <span className="panel-eyebrow">
            INPUT CONDITIONS
          </span>

          <h3>
            Inlet flow rates
          </h3>

          <p>
            Specify the four inlet
            operating conditions.
          </p>
        </div>

      </div>


      <form
        onSubmit={handleSubmit}
        className="input-form"
      >

        {inletDefinitions.map(
          (inlet) => (

            <div
              className="input-field"
              key={inlet.key}
            >

              <label
                htmlFor={inlet.key}
              >

                <span>
                  {inlet.name}
                </span>

                <small>
                  {inlet.location}
                </small>

              </label>


              <div className="input-wrapper">

                <input
                  id={inlet.key}
                  type="number"
                  step="0.01"
                  min="-10"
                  max="10"
                  value={
                    inputs[inlet.key] ?? ""
                  }
                  onChange={(event) =>
                    handleChange(
                      inlet.key,
                      event.target.value
                    )
                  }
                  required
                />

              </div>

            </div>

          )
        )}


        <div className="input-actions">

          <button
            type="button"
            className="reset-button"
            onClick={handleReset}
            disabled={loading}
          >

            <RotateCcw size={16} />

            Reset

          </button>


          <button
            type="submit"
            className="predict-button"
            disabled={
              loading ||
              Object.values(inputs).some(
                (value) =>
                  value === "" ||
                  value === null ||
                  value === undefined ||
                  Number.isNaN(
                    Number(value)
                  )
              )
            }
          >

            <Sparkles size={17} />

            {loading
              ? "Predicting..."
              : "Predict Mixing Pattern"}

          </button>

        </div>

      </form>

    </div>
  );
}