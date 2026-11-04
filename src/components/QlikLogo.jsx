import logo from "../assets/qlik-logo.png";

// Source artwork is 419 x 189 (the official Qlik logo, original colours, on white; it sits on a white pill). Sized in em so it scales with the surrounding title text.
// Swap the <image> for the paths of src/assets/brand/qlik-logo-white.svg once that file is available.
export default function QlikLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 419 189" role="img" aria-label="Qlik" focusable="false">
      <image href={logo} width="419" height="189" />
    </svg>
  );
}
