import React, { forwardRef } from "react";
import { getQrUrl, getShareUrl, SHARE_CTA } from "@/lib/socialShare";

const ShareCard = forwardRef(({ achievement, type, title, userName, executiveScore, leadershipLevel, date, hideName, hideScore, referralCode }, ref) => {
  const config = type || achievement;
  if (!config) return null;
  const shareUrl = getShareUrl(referralCode);
  const formattedDate = date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div ref={ref} style={{ width: 340, minHeight: 480, background: "#0d0d14", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", fontFamily: "ui-sans-serif, system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: config.color, opacity: 0.08 }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>EXECLEAD<span style={{ color: config.color }}>.AI</span></div>
          <div style={{ fontSize: 9, color: "#ffffff40", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Executive Leadership OS</div>
        </div>
        <div style={{ fontSize: 9, color: "#ffffff30", textAlign: "right" }}>{formattedDate}</div>
      </div>

      <div style={{ height: 1, background: "#ffffff10", marginBottom: 28 }} />

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${config.color}20`, border: `2px solid ${config.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
          {config.badge}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: config.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Achievement Unlocked</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{title || config.label}</div>
      </div>

      {!hideName && userName && (
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff90" }}>{userName}</div>
        </div>
      )}

      {!hideScore && (executiveScore || leadershipLevel) && (
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
          {executiveScore && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: config.color }}>{executiveScore}</div>
              <div style={{ fontSize: 9, color: "#ffffff40", textTransform: "uppercase", letterSpacing: "0.05em" }}>Exec Score</div>
            </div>
          )}
          {leadershipLevel && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 4 }}>{leadershipLevel}</div>
              <div style={{ fontSize: 9, color: "#ffffff40", textTransform: "uppercase", letterSpacing: "0.05em" }}>Level</div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 12, padding: "8px 12px", background: `${config.color}10`, borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: "#ffffff60", fontWeight: 500 }}>{SHARE_CTA}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid #ffffff10" }}>
          <img src={getQrUrl(shareUrl)} alt="QR" crossOrigin="anonymous" style={{ width: 56, height: 56, borderRadius: 8 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#ffffff60" }}>Scan to join</div>
            <div style={{ fontSize: 10, color: "#ffffff30" }}>execlead.ai</div>
          </div>
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
export default ShareCard;