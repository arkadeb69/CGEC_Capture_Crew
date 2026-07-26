import { useState, useEffect, useRef } from "react";

export default function EventTimelineTrack({ events, staticIcons, navigate, generateSlug, siteConfig }) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Events list with order preserved (latest first)
  const displayEvents = [...events].sort((a, b) => (a.order || 99) - (b.order || 99));

  // Add Universal Archive as final destination on the track
  const allTrackItems = [
    ...displayEvents.map(e => ({ type: 'event', ...e })),
    {
      id: 'archive-global',
      type: 'archive',
      name: 'Event Archive',
      subtitle: 'Universal Gallery',
      desc: 'Explore every capture from every event we\'ve ever hosted, all in one immersive timeline.',
      date: 'FULL ARCHIVE',
      color: '#C9A96E',
      emoji: '📂',
      highlight: '✨ IMMERSIVE VIEW'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress percentage through the timeline container
      const totalScrollable = rect.height - windowHeight * 0.4;
      const currentScroll = windowHeight * 0.7 - rect.top;
      
      let progress = currentScroll / totalScrollable;
      progress = Math.max(0, Math.min(1, progress));
      
      setScrollProgress(progress);
      
      // Active index based on progress position
      const idx = Math.min(
        Math.floor(progress * allTrackItems.length),
        allTrackItems.length - 1
      );
      setActiveIndex(Math.max(0, idx));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [allTrackItems.length]);

  const carPositionPercent = Math.min(Math.max(scrollProgress * 100, 3), 97);
  const currentActiveItem = allTrackItems[activeIndex] || allTrackItems[0];

  return (
    <div className="timeline-track-section" ref={containerRef}>
      <div className="timeline-header-wrap fade-in">
        <div className="section-label">✧ Interactive Journey</div>
        <h3 className="timeline-title">Event <em>Timeline Track</em></h3>
        <p className="timeline-sub">Scroll down to drive along the event timeline and explore our campus milestones.</p>
      </div>

      {isMobile ? (
        /* MOBILE VERTICAL TIMELINE TRACK */
        <div className="mobile-timeline-wrap">
          <div className="mobile-track-line">
            <div 
              className="mobile-track-progress" 
              style={{ height: `${carPositionPercent}%` }}
            ></div>
            <div 
              className="mobile-car-marker" 
              style={{ top: `${carPositionPercent}%` }}
            >
              <div className="car-vehicle">🚘</div>
              <div className="car-date-badge">{currentActiveItem?.date || "2026"}</div>
            </div>
          </div>

          <div className="mobile-cards-list">
            {allTrackItems.map((item, idx) => {
              const isActive = idx === activeIndex;
              const logoUrl = (item.iconUrl && item.iconUrl.trim().startsWith('http')) 
                ? item.iconUrl.trim() 
                : (staticIcons && staticIcons[item.id] && staticIcons[item.id].trim().startsWith('http') ? staticIcons[item.id].trim() : null);
              
              const itemColor = item.color || "var(--gold)";

              return (
                <div 
                  key={item.id || idx}
                  className={`timeline-card mobile-card ${isActive ? 'active-card' : ''}`}
                  style={{ "--item-color": itemColor }}
                >
                  <div className="card-top-header">
                    {logoUrl ? (
                      <img src={logoUrl} alt={item.name} className="timeline-logo" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="timeline-emoji">{item.emoji || '📸'}</span>
                    )}
                    <span className="timeline-date-chip">{item.date}</span>
                  </div>

                  <h4 className="timeline-card-title">{item.name}</h4>
                  <div className="timeline-card-sub" style={{ color: itemColor }}>{item.subtitle}</div>
                  <p className="timeline-card-desc">{item.desc}</p>
                  {item.highlight && <div className="timeline-card-highlight">{item.highlight}</div>}

                  <button 
                    className="timeline-dive-btn"
                    style={{ background: itemColor }}
                    onClick={() => {
                      if (item.type === 'archive') {
                        navigate('/events-gallery');
                      } else if (item.comingSoon) {
                        alert("Coming Soon!");
                      } else {
                        navigate(`/events/${item.slug || generateSlug(item.name)}`);
                      }
                    }}
                  >
                    {item.type === 'archive' ? 'Open Archive 📂' : (item.comingSoon ? 'Coming Soon ⏳' : 'Dive In 🚀')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DESKTOP HORIZONTAL TIMELINE TRACK */
        <div className="desktop-timeline-container">
          {/* MAIN TRACK LINE */}
          <div className="timeline-main-track">
            <div className="track-bg-line"></div>
            <div 
              className="track-fill-line" 
              style={{ width: `${carPositionPercent}%` }}
            ></div>

            {/* VEHICLE MARKER ON TRACK */}
            <div 
              className="timeline-car-vehicle" 
              style={{ left: `${carPositionPercent}%` }}
            >
              <div className="car-icon">🏎️</div>
              <div className="car-date-tooltip">{currentActiveItem?.date || "2026"}</div>
            </div>

            {/* STATION NODES ON TRACK */}
            {allTrackItems.map((item, idx) => {
              const nodePos = (idx / (allTrackItems.length - 1)) * 100;
              const isActive = idx === activeIndex;
              const isPassed = idx <= activeIndex;

              return (
                <div 
                  key={item.id || idx}
                  className={`station-node ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                  style={{ left: `${nodePos}%`, "--item-color": item.color || "var(--gold)" }}
                >
                  <div className="node-dot"></div>
                  <div className="node-label">{item.date}</div>
                </div>
              );
            })}
          </div>

          {/* STAGGERED CARDS GRID (ALTERNATING TOP / BOTTOM) */}
          <div className="staggered-cards-wrapper">
            {allTrackItems.map((item, idx) => {
              const isActive = idx === activeIndex;
              const isTop = idx % 2 === 0; // Alternates Top and Bottom
              const leftPos = (idx / (allTrackItems.length - 1)) * 90 + 5; // Spread across track
              const logoUrl = (item.iconUrl && item.iconUrl.trim().startsWith('http')) 
                ? item.iconUrl.trim() 
                : (staticIcons && staticIcons[item.id] && staticIcons[item.id].trim().startsWith('http') ? staticIcons[item.id].trim() : null);
              
              const itemColor = item.color || "var(--gold)";

              return (
                <div 
                  key={item.id || idx}
                  className={`timeline-staggered-card ${isTop ? 'pos-top' : 'pos-bottom'} ${isActive ? 'active-card' : ''}`}
                  style={{ 
                    left: `${leftPos}%`, 
                    "--item-color": itemColor 
                  }}
                >
                  <div className="card-glass-panel">
                    <div className="card-top-header">
                      {logoUrl ? (
                        <img src={logoUrl} alt={item.name} className="timeline-logo" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="timeline-emoji">{item.emoji || '📸'}</span>
                      )}
                      <span className="timeline-date-chip">{item.date}</span>
                    </div>

                    <h4 className="timeline-card-title">{item.name}</h4>
                    <div className="timeline-card-sub" style={{ color: itemColor }}>{item.subtitle}</div>
                    <p className="timeline-card-desc">{item.desc}</p>
                    {item.highlight && <div className="timeline-card-highlight">{item.highlight}</div>}

                    <button 
                      className="timeline-dive-btn"
                      style={{ background: itemColor }}
                      onClick={() => {
                        if (item.type === 'archive') {
                          navigate('/events-gallery');
                        } else if (item.comingSoon) {
                          alert("Coming Soon!");
                        } else {
                          navigate(`/events/${item.slug || generateSlug(item.name)}`);
                        }
                      }}
                    >
                      {item.type === 'archive' ? 'Open Archive 📂' : (item.comingSoon ? 'Coming Soon ⏳' : 'Dive In 🚀')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
