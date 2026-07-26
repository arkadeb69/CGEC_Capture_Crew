import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function FrameNotFoundPage() {
  useEffect(() => {
    document.title = "Frame Not Found — Capture Crew";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "Frame Not Found. The page you are looking for does not exist on Capture Crew.";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="frame-404-wrapper">
      <div className="backdrop"></div>
      <div className="bokeh">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="grain"></div>
      <div className="vignette"></div>

      <div className="brand">
        Capture <span>Crew</span>
      </div>

      <div className="stage">
        <div className="bracket tl"></div>
        <div className="bracket tr"></div>
        <div className="bracket bl"></div>
        <div className="bracket br"></div>
        <div className="rec">
          <span className="dot"></span>AF · SEARCHING
        </div>

        <div className="center">
          <div className="aperture-wrap">
            <div className="num">
              4<span className="zero">0</span>4
            </div>
          </div>
          <div className="headline">Frame Not Found</div>
          <div className="sub">
            The shot you're after <em>never made it into the roll</em>. Wrong link, moved page, or a moment that got cropped out.
          </div>
          <Link className="shutter-btn" to="/">
            <span className="ring"></span>Return to the Gallery
          </Link>
        </div>
      </div>

      <div className="exif">
        <span>
          ISO&nbsp;<b>404</b>
        </span>
        <span className="sep">/</span>
        <span>
          ƒ/<b>0.0</b>
        </span>
        <span className="sep">/</span>
        <span>
          SS&nbsp;<b>∞</b>
        </span>
        <span className="sep">/</span>
        <span>
          WB&nbsp;<b className="fail">LOST</b>
        </span>
        <span className="sep">/</span>
        <span>
          FOCUS&nbsp;<b className="fail">FAILED</b>
        </span>
      </div>
    </div>
  );
}
