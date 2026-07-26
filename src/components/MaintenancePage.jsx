import React, { useEffect } from 'react';

const DEFAULT_MAINTENANCE_TEXT = `# Official Notice

### Capture Crew & Other Student Clubs Temporarily Inactive

Due to ongoing administrative circumstances, the existing Student Body and student representative committee of Cooch Behar Government Engineering College has been dissolved.

As a result, all student-managed cultural and technical clubs, including Capture Crew, are currently inactive and will not be organizing events, activities, or official programs until further notice.

This website has been placed in maintenance mode during this period.

We appreciate your patience and understanding.

For official updates, please follow college notifications and announcements.

— CGEC Student Body`;

export default function MaintenancePage({ config, siteConfig }) {
  useEffect(() => {
    // Add noindex meta tag dynamically
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";

    document.title = "Maintenance | " + (siteConfig?.siteName || "Capture Crew");

    return () => {
      // Cleanup when unmounting (e.g. admin logs in)
      if (metaRobots) {
        metaRobots.content = "index, follow"; // Restore default
      }
    };
  }, [siteConfig]);

  const rawMessage = config?.message || DEFAULT_MAINTENANCE_TEXT;

  // Extremely basic markdown-to-HTML parser for the specific formatting
  const parseMarkdown = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index}>{line.replace('# ', '')}</h1>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <div className="maintenance-wrapper">
      <div className="maintenance-content">
        <img 
          src={siteConfig?.logoUrl || "/logo.jpg"} 
          alt="Capture Crew Logo" 
          className="maintenance-logo"
        />
        
        {config?.title && config.title !== "Official Notice" && (
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>{config.title}</h1>
        )}

        <div className="maintenance-message">
          {parseMarkdown(rawMessage)}
        </div>

        {config?.expectedReturnDate && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(201, 169, 110, 0.1)', borderRadius: '8px', display: 'inline-block' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Expected Return:</span> {new Date(config.expectedReturnDate).toLocaleDateString()}
          </div>
        )}

        <div className="maintenance-footer">
          <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1rem' }}>Contact us at <a href="mailto:contact@capturecrew.site" style={{ color: 'var(--gold)', textDecoration: 'none' }}>contact@capturecrew.site</a></p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {siteConfig?.instaLink && <a href={siteConfig.instaLink} target="_blank" rel="noreferrer" style={{ color: 'var(--white)', opacity: 0.8, textDecoration: 'none' }}>Instagram</a>}
            {(siteConfig?.linkedinLink || siteConfig?.waLink) && <a href={siteConfig?.linkedinLink || "https://www.linkedin.com/company/cgec-capture-crew/"} target="_blank" rel="noreferrer" style={{ color: 'var(--white)', opacity: 0.8, textDecoration: 'none' }}>LinkedIn</a>}
            {siteConfig?.fbLink && <a href={siteConfig.fbLink} target="_blank" rel="noreferrer" style={{ color: 'var(--white)', opacity: 0.8, textDecoration: 'none' }}>Facebook</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
