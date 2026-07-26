import "./Button.css";

function Button({ children, className = "", ...props }) {
  const buttonClassName = ["button", className].filter(Boolean).join(" ");

  return (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
}

export default Button;
