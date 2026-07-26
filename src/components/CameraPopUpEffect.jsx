import { useEffect } from "react";
import lottie from "lottie-web";
import cameraData from "../assets/camera-popup.json";

export default function CameraPopUpEffect() {
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Exclude interactive elements so normal clicks/inputs aren't interrupted
      const target = e.target;
      if (!target) return;

      const isInteractive = target.closest(
        'button, a, input, select, textarea, img, video, audio, iframe, form, .retro-window-card, .event-btn, .uiverse-submit-btn, .lightbox, .admin-panel, .nav-links, .social-icon, .filter-chip, [role="button"], [tabindex]:not([tabindex="-1"])'
      );

      if (isInteractive) return;

      // Handle left click (button 0) and right click (button 2)
      if (e.type === 'contextmenu') {
        // Prevent context menu on empty space to allow camera pop animation
        e.preventDefault();
      }

      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);

      // Create container element centered at cursor position
      const popupSize = 140; // 140px size
      const container = document.createElement("div");
      container.className = "camera-popup-instance";
      container.style.cssText = `
        position: fixed;
        left: ${clientX - popupSize / 2}px;
        top: ${clientY - popupSize / 2}px;
        width: ${popupSize}px;
        height: ${popupSize}px;
        pointer-events: none;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 0 12px rgba(201, 169, 110, 0.4));
        transition: opacity 0.3s ease, transform 0.3s ease;
      `;

      document.body.appendChild(container);

      // Initialize Lottie animation instance
      const anim = lottie.loadAnimation({
        container: container,
        renderer: "svg",
        loop: false,
        autoplay: true,
        animationData: cameraData
      });

      // Cleanup logic after playback finishes
      const removeInstance = () => {
        container.style.opacity = "0";
        container.style.transform = "scale(0.8)";
        setTimeout(() => {
          try {
            anim.destroy();
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          } catch (err) {
            // Ignore if already removed
          }
        }, 300);
      };

      anim.addEventListener("complete", removeInstance);

      // Fallback cleanup timer in case animation complete event isn't fired
      setTimeout(removeInstance, 2200);
    };

    window.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("contextmenu", handleGlobalClick);

    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("contextmenu", handleGlobalClick);
    };
  }, []);

  return null; // Renderless component attached to global window events
}
