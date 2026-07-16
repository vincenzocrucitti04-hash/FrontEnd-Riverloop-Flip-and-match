import "./PokeBall.css";

function PokeBall({ size = "medium", label = "" }) {
  const accessibilityProps = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": "true" };

  return (
    <span className={`poke-ball poke-ball--${size}`} {...accessibilityProps}>
      <span className="poke-ball__button" />
    </span>
  );
}

export default PokeBall;
